/**
 * Main Dashboard Service
 * Service for fetching and processing main dashboard data including branch sales
 */

import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import {
  MainDashboardRequest,
  MainDashboardApiResponse,
  BranchApiData,
} from './types';
import { cacheManager, generateCacheKey } from './cache';
import type { BranchSalesData } from '@/components/daily-sales-branches';

// Track active requests to prevent duplicate calls and rate limiting
const activeRequests = new Map<string, Promise<{ branches: BranchSalesData[]; totalSales: number; error?: string }>>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  windowMs: 60 * 1000, // 1 minute in milliseconds
  requestCounts: new Map<string, { count: number; resetTime: number }>(),
};

/**
 * Check if request is within rate limit
 * @param key - The cache key to track rate limiting for
 * @returns boolean indicating if request is allowed
 */
const isWithinRateLimit = (key: string): boolean => {
  const now = Date.now();
  const requestData = RATE_LIMIT.requestCounts.get(key);

  // If no previous requests or window has expired, reset
  if (!requestData || now >= requestData.resetTime) {
    RATE_LIMIT.requestCounts.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  // Check if under limit
  if (requestData.count < RATE_LIMIT.maxRequestsPerMinute) {
    requestData.count++;
    return true;
  }

  // Rate limit exceeded
  return false;
};

/**
 * Clean up expired rate limit entries to prevent memory leaks
 */
const cleanupRateLimit = (): void => {
  const now = Date.now();
  for (const [key, data] of RATE_LIMIT.requestCounts.entries()) {
    if (now >= data.resetTime) {
      RATE_LIMIT.requestCounts.delete(key);
    }
  }
};

// Clean up rate limit entries every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

/**
 * Process API branch data into component-compatible format
 * Maps the API response structure to the BranchSalesData interface
 *
 * @param branchName - The branch name from API response key
 * @param branchData - Current period branch data
 * @param previousBranchData - Previous period branch data for percentage calculation (optional)
 */
const processBranchData = (
  branchName: string,
  branchData: BranchApiData,
  previousBranchData?: BranchApiData
): BranchSalesData => {
  // Calculate total sales from open accounts and closed tickets
  const totalSales = branchData.open_accounts.money + branchData.closed_ticket.money;

  // Calculate total tickets from both open and closed accounts
  const totalTickets = branchData.open_accounts.total + branchData.closed_ticket.total;

  // Calculate percentage based on week-over-week comparison
  let calculatedPercentage = 100; // Default to 100% if no previous data

  if (previousBranchData) {
    const previousTotalSales = previousBranchData.open_accounts.money + previousBranchData.closed_ticket.money;

    if (previousTotalSales > 0) {
      calculatedPercentage = ((totalSales - previousTotalSales) / previousTotalSales) * 100;
    } else if (totalSales > 0) {
      calculatedPercentage = 100; // 100% increase when previous was 0 but current has sales
    } else {
      calculatedPercentage = 0; // No change when both periods are 0
    }
  }

  // Generate avatar from first letter of branch name
  const avatar = branchName.charAt(0).toUpperCase();

  // Extract location from branch name if present (e.g., "Animal (CDMX)" -> "CDMX")
  const locationMatch = branchName.match(/\(([^)]+)\)/);
  const location = locationMatch ? locationMatch[1] : '';

  return {
    id: branchData.store_id.toString(),
    name: branchName,
    location,
    totalSales,
    percentage: calculatedPercentage,
    openAccounts: branchData.open_accounts.money,
    closedSales: branchData.closed_ticket.money,
    averageTicket: branchData.average_ticket,
    totalTickets,
    avatar,
  };
};

/**
 * Process API response into component-ready branch data
 *
 * @param currentResponse - Current period API response
 * @param previousResponse - Previous period API response for percentage calculation (optional)
 */
const processApiResponse = (
  currentResponse: MainDashboardApiResponse,
  previousResponse?: MainDashboardApiResponse
): BranchSalesData[] => {
  // Validate current response structure
  if (!currentResponse.success || !currentResponse.data?.cards) {
    console.warn('Main Dashboard API: Invalid response structure', currentResponse);
    return [];
  }

  // Extract previous period data for comparison
  const previousCards = previousResponse?.success && previousResponse.data?.cards
    ? previousResponse.data.cards
    : {};

  // Convert branch data from API format to component format
  const branches: BranchSalesData[] = Object.entries(currentResponse.data.cards)
    .map(([branchName, branchData]) => {
      try {
        // Find matching previous period data for this branch
        const previousBranchData = previousCards[branchName];
        return processBranchData(branchName, branchData, previousBranchData);
      } catch (error) {
        console.warn(`Failed to process branch data for ${branchName}:`, error);
        return null;
      }
    })
    .filter((branch): branch is BranchSalesData => branch !== null);

  // Sort by total sales descending (highest first)
  return branches.sort((a, b) => b.totalSales - a.totalSales);
};

/**
 * Calculate the date for the same day of the previous week
 * @param date - The current date
 * @returns The date 7 days earlier
 */
const getPreviousWeekDate = (date: Date): Date => {
  const previousWeekDate = new Date(date);
  previousWeekDate.setDate(date.getDate() - 7);
  return previousWeekDate;
};

/**
 * Fetch main dashboard data from API with optional previous week comparison
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param includePreviousWeek - Whether to fetch previous week data for percentage calculation
 */
export const fetchMainDashboardData = async (
  startDate: string,
  endDate: string,
  includePreviousWeek: boolean = true
): Promise<{ branches: BranchSalesData[]; totalSales: number; error?: string }> => {
  // Generate cache key
  const cacheKey = generateCacheKey('main-dashboard', startDate, endDate, includePreviousWeek ? 'with-prev' : 'no-prev');

  // Check cache first
  const cachedData = cacheManager.get<{ branches: BranchSalesData[]; totalSales: number }>(cacheKey);
  if (cachedData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Returning cached dashboard data for:', cacheKey);
    }
    return cachedData;
  }

  // Check if there's already an active request for this data
  const activeRequest = activeRequests.get(cacheKey);
  if (activeRequest) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⏳ Reusing active request for:', cacheKey);
    }
    return activeRequest;
  }

  // Check rate limiting before making request
  if (!isWithinRateLimit(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 Rate limit exceeded for:', cacheKey);
    }
    return {
      branches: [],
      totalSales: 0,
      error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.'
    };
  }

  // Create new request promise
  const requestPromise = (async () => {
    try {
      // Prepare current period request
      const currentRequest: MainDashboardRequest = {
        start_date: startDate,
        end_date: endDate
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 FETCHING MAIN DASHBOARD DATA:', currentRequest);
      }

      // Make current period API call
      const currentResponse = await apiPost<MainDashboardApiResponse>(
        API_ENDPOINTS.MAIN_DASHBOARD,
        currentRequest
      );

      let previousResponse: { data: MainDashboardApiResponse } | undefined;

      // Fetch previous week data if requested (for single day comparisons)
      if (includePreviousWeek && startDate === endDate) {
        try {
          const currentDate = new Date(startDate);
          const previousWeekDate = getPreviousWeekDate(currentDate);
          const previousWeekDateStr = formatDateForApi(previousWeekDate);

          const previousRequest: MainDashboardRequest = {
            start_date: previousWeekDateStr,
            end_date: previousWeekDateStr
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('🚀 FETCHING PREVIOUS WEEK DATA:', previousRequest);
          }

          previousResponse = await apiPost<MainDashboardApiResponse>(
            API_ENDPOINTS.MAIN_DASHBOARD,
            previousRequest
          );
        } catch (previousError) {
          console.warn('Failed to fetch previous week data for comparison:', previousError);
          // Continue without previous week data
        }
      }

      // Process response with comparison data
      const branches = processApiResponse(currentResponse.data, previousResponse?.data);
      const totalSales = currentResponse.data.data?.sales?.total || 0;

      const result = { branches, totalSales };

      // Cache the processed data (20 minutes TTL)
      cacheManager.set(cacheKey, result);

      // Remove from active requests
      activeRequests.delete(cacheKey);

      return result;
    } catch (error) {
      const apiError = error as ApiError;

      console.error('Failed to fetch main dashboard data:', apiError);

      // Remove from active requests
      activeRequests.delete(cacheKey);

      // Return error state
      return {
        branches: [],
        totalSales: 0,
        error: apiError.message || 'Failed to load dashboard data'
      };
    }
  })();

  // Store the promise in active requests
  activeRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

/**
 * Validate date range for API request
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
};

/**
 * Format date to API format (YYYY-MM-DD)
 */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Clear main dashboard cache
 */
export const clearMainDashboardCache = (startDate?: string, endDate?: string): void => {
  if (startDate && endDate) {
    // Clear both with and without previous week data
    const cacheKey1 = generateCacheKey('main-dashboard', startDate, endDate, 'with-prev');
    const cacheKey2 = generateCacheKey('main-dashboard', startDate, endDate, 'no-prev');
    cacheManager.delete(cacheKey1);
    cacheManager.delete(cacheKey2);

    // Also clear from active requests if present
    activeRequests.delete(cacheKey1);
    activeRequests.delete(cacheKey2);
  } else {
    // Clear all main dashboard cache entries
    // This is a simplified approach - in production you might want
    // to track keys or use a more sophisticated cache
    cacheManager.clear();

    // Clear all active requests
    activeRequests.clear();
  }
};

/**
 * Retry failed request with exponential backoff
 */
export const fetchWithRetry = async (
  startDate: string,
  endDate: string,
  includePreviousWeek: boolean = true,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<{ branches: BranchSalesData[]; totalSales: number; error?: string }> => {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff

        if (process.env.NODE_ENV === 'development') {
          console.log(`Retry attempt ${attempt} for date range: ${startDate} - ${endDate}`);
        }
      }

      return await fetchMainDashboardData(startDate, endDate, includePreviousWeek);
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        console.error('All retry attempts failed:', lastError);
        break;
      }
    }
  }

  // Return error state after all retries failed
  return {
    branches: [],
    totalSales: 0,
    error: lastError?.message || 'Failed to load dashboard data after multiple attempts'
  };
};