/**
 * Weekly Chart Service
 * Service for fetching and processing weekly chart comparison data from main dashboard API
 */

import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import { cacheManager, generateCacheKey } from './cache';
import type { WeeklyChartData, ChartDayData } from '@/components/weekly-chart-comparison/types';

// Track active requests to prevent duplicate calls
// We use unknown type here since we track different types of promises
const activeRequests = new Map<string, Promise<unknown>>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 8,
  windowMs: 60 * 1000, // 1 minute in milliseconds
  requestCounts: new Map<string, { count: number; resetTime: number }>(),
};

/**
 * API request interface for weekly chart data
 */
interface WeeklyChartRequest {
  start_date: string;
  end_date: string;
  range: 'week';
}

/**
 * API response interface for main dashboard data
 */
interface WeeklyChartApiResponse {
  success: boolean;
  message: string;
  data: {
    sales: {
      total: number;
      subtotal: number;
    };
    cards: Record<string, unknown>; // Branch data not needed for chart
    range: {
      actual: Record<string, number>;   // Current week data (YYYY-MM-DD: amount)
      last: Record<string, number>;     // Previous week data (YYYY-MM-DD: amount)
      two_last: Record<string, number>; // Two weeks ago data (YYYY-MM-DD: amount)
    };
  };
}

/**
 * Check if request is within rate limit
 */
const isWithinRateLimit = (key: string): boolean => {
  const now = Date.now();
  const requestData = RATE_LIMIT.requestCounts.get(key);

  if (!requestData || now >= requestData.resetTime) {
    RATE_LIMIT.requestCounts.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (requestData.count < RATE_LIMIT.maxRequestsPerMinute) {
    requestData.count++;
    return true;
  }

  return false;
};

/**
 * Spanish day names for chart
 */
const SPANISH_DAY_NAMES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const FULL_SPANISH_DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Removed unused function - was used for mapping API day to chart index

/**
 * Generate Spanish date range labels for weeks
 */
const generateWeekLabels = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate date ranges for the 3 weeks
  const currentWeekStart = new Date(start);
  const currentWeekEnd = new Date(end);

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(currentWeekEnd);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const twoWeeksAgoStart = new Date(currentWeekStart);
  twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 14);
  const twoWeeksAgoEnd = new Date(currentWeekEnd);
  twoWeeksAgoEnd.setDate(twoWeeksAgoEnd.getDate() - 14);

  // Format dates in Spanish
  const formatWeekRange = (start: Date, end: Date): string => {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    const endMonth = end.toLocaleString('es-ES', { month: 'short' }).replace('.', '');

    if (startMonth === endMonth) {
      return `${startDay}-${endDay} ${startMonth}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    }
  };

  return [
    formatWeekRange(currentWeekStart, currentWeekEnd),    // Current week
    formatWeekRange(lastWeekStart, lastWeekEnd),          // Last week
    formatWeekRange(twoWeeksAgoStart, twoWeeksAgoEnd),    // Two weeks ago
  ];
};

/**
 * Process API response into weekly chart data format
 */
const processApiResponse = (response: WeeklyChartApiResponse, startDate: string, endDate: string): WeeklyChartData => {
  if (!response.success || !response.data?.range) {
    console.warn('Weekly Chart API: Invalid response structure', response);
    throw new Error('Invalid API response structure');
  }

  const { actual, last, two_last } = response.data.range;

  // Initialize chart data for all 7 days
  const dailyData: ChartDayData[] = SPANISH_DAY_NAMES.map((dayName, index) => ({
    dayName,
    fullDayName: FULL_SPANISH_DAY_NAMES[index],
    week1: 0, // Current week (actual)
    week2: 0, // Previous week (last)
    week3: 0, // Two weeks ago (two_last)
  }));

  // Helper function to process week data with date keys
  const processWeekData = (weekData: Record<string, number>, weekProperty: 'week1' | 'week2' | 'week3') => {
    // Convert the week data object to array sorted by date
    const sortedDates = Object.keys(weekData).sort();

    // Map each date to the corresponding day index (Monday=0, Tuesday=1, etc.)
    sortedDates.forEach((dateStr, index) => {
      if (index < 7) { // Ensure we don't exceed 7 days
        const amount = weekData[dateStr];
        dailyData[index][weekProperty] = typeof amount === 'number' ? amount : 0;
      }
    });
  };

  // Process data for each week
  processWeekData(actual, 'week1');
  processWeekData(last, 'week2');
  processWeekData(two_last, 'week3');

  return {
    dailyData,
    weekLabels: generateWeekLabels(startDate, endDate),
    weekColors: ['#897053', '#6b5d4a', '#4a3d2f'], // Primary theme colors
  };
};

/**
 * Fetch weekly chart data from API
 *
 * @param startDate - Start date of the week in YYYY-MM-DD format (Monday)
 * @param endDate - End date of the week in YYYY-MM-DD format (Sunday)
 */
export const fetchWeeklyChartData = async (
  startDate: string,
  endDate: string
): Promise<{ data: WeeklyChartData | null; error?: string }> => {
  // Generate cache key
  const cacheKey = generateCacheKey('weekly-chart', startDate, endDate);

  // Check cache first
  const cachedData = cacheManager.get<{ data: WeeklyChartData | null }>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Check if there's already an active request for this data
  const activeRequest = activeRequests.get(cacheKey);
  if (activeRequest) {
    return activeRequest as Promise<{ data: WeeklyChartData | null; error?: string }>;
  }

  // Check rate limiting before making request
  if (!isWithinRateLimit(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 Rate limit exceeded for weekly chart:', cacheKey);
    }
    return {
      data: null,
      error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.'
    };
  }

  // Create new request promise
  const requestPromise = (async () => {
    try {
      const request: WeeklyChartRequest = {
        start_date: startDate,
        end_date: endDate,
        range: 'week'
      };

      // Make API call using the main dashboard endpoint
      const response = await apiPost<WeeklyChartApiResponse>(
        API_ENDPOINTS.MAIN_DASHBOARD,
        request
      );

      // Process response into chart format
      const chartData = processApiResponse(response.data, startDate, endDate);

      const result = { data: chartData };

      // Cache the processed data (15 minutes TTL for chart data)
      cacheManager.set(cacheKey, result, { ttl: 15 * 60 * 1000 });

      // Remove from active requests
      activeRequests.delete(cacheKey);

      return result;
    } catch (error) {
      const apiError = error as ApiError;

      console.error('Failed to fetch weekly chart data:', apiError);

      // Remove from active requests
      activeRequests.delete(cacheKey);

      // Return error state
      return {
        data: null,
        error: apiError.message || 'Failed to load weekly chart data'
      };
    }
  })();

  // Store the promise in active requests
  activeRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

/**
 * Validate date range for weekly chart API request
 */
export const isValidWeeklyChartDateRange = (startDate: string, endDate: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // Must be exactly 6 days apart (7 day week)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  if (daysDiff !== 6) {
    return false;
  }

  // Start must be Monday (1) and end must be Sunday (0)
  const startDay = start.getDay();
  const endDay = end.getDay();

  return (startDay === 1 && endDay === 0) || (startDay === 0 && endDay === 6);
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
 * Clear weekly chart cache
 */
export const clearWeeklyChartCache = (startDate?: string, endDate?: string): void => {
  if (startDate && endDate) {
    const cacheKey = generateCacheKey('weekly-chart', startDate, endDate);
    cacheManager.delete(cacheKey);
    activeRequests.delete(cacheKey);
  } else {
    // Clear all weekly chart cache entries by clearing the full cache
    // In production, you might want to be more selective
    cacheManager.clear();
    activeRequests.clear();
  }
};

/**
 * Fetch raw weekly data from API (returns unprocessed API response)
 */
export const fetchRawWeeklyData = async (
  startDate: string,
  endDate: string
): Promise<{ data: WeeklyChartApiResponse | null; rawData?: WeeklyChartApiResponse; error?: string }> => {
  // Generate cache key
  const cacheKey = generateCacheKey('weekly-raw', startDate, endDate);

  // Debug logging for tracking API calls
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 fetchRawWeeklyData: Called for ${startDate} to ${endDate}`);
  }

  // Check cache first
  const cachedData = cacheManager.get<{ data: WeeklyChartApiResponse | null; rawData?: WeeklyChartApiResponse }>(cacheKey);
  if (cachedData) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ fetchRawWeeklyData: Returning cached data for ${startDate} to ${endDate}`);
    }
    return cachedData;
  }

  // Check if there's already an active request for this data
  const activeRequest = activeRequests.get(cacheKey);
  if (activeRequest) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏳ fetchRawWeeklyData: Returning active request for ${startDate} to ${endDate}`);
    }
    // Return the cached request result
    return activeRequest as Promise<{ data: WeeklyChartApiResponse | null; rawData?: WeeklyChartApiResponse; error?: string }>;
  }

  // Check rate limiting before making request
  if (!isWithinRateLimit(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 Rate limit exceeded for raw weekly data:', cacheKey);
    }
    return {
      data: null,
      error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.'
    };
  }

  // Create the request promise and store it immediately to prevent duplicate calls
  const requestPromise = (async () => {
    try {
      const request: WeeklyChartRequest = {
        start_date: startDate,
        end_date: endDate,
        range: 'week'
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 fetchRawWeeklyData: Making actual API call to ${API_ENDPOINTS.MAIN_DASHBOARD} for ${startDate} to ${endDate}`);
      }

      // Make API call using the main dashboard endpoint
      const response = await apiPost<WeeklyChartApiResponse>(
        API_ENDPOINTS.MAIN_DASHBOARD,
        request
      );

      const result = {
        data: response.data,
        rawData: response.data
      };

      // Cache the raw data (15 minutes TTL)
      cacheManager.set(cacheKey, result, { ttl: 15 * 60 * 1000 });

      // Remove from active requests
      activeRequests.delete(cacheKey);

      return result;
    } catch (error) {
      const apiError = error as ApiError;

      console.error('Failed to fetch raw weekly data:', apiError);

      // Remove from active requests
      activeRequests.delete(cacheKey);

      // Return error state
      return {
        data: null,
        error: apiError.message || 'Failed to load raw weekly data'
      };
    }
  })();

  // Store the promise in active requests to prevent duplicate calls
  activeRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

/**
 * Retry failed request with exponential backoff
 */
export const fetchWeeklyChartWithRetry = async (
  startDate: string,
  endDate: string,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<{ data: WeeklyChartData | null; rawData?: WeeklyChartApiResponse; error?: string }> => {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }

      // First get the raw data
      const rawResult = await fetchRawWeeklyData(startDate, endDate);

      if (rawResult.error) {
        return {
          data: null,
          rawData: rawResult.rawData,
          error: rawResult.error
        };
      }

      if (!rawResult.data) {
        return {
          data: null,
          rawData: rawResult.rawData,
          error: 'No data received from API'
        };
      }

      // Process the raw data into chart format
      const chartData = processApiResponse(rawResult.data, startDate, endDate);

      return {
        data: chartData,
        rawData: rawResult.rawData || rawResult.data
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        console.error('All weekly chart retry attempts failed:', lastError);
        break;
      }
    }
  }

  // Return error state after all retries failed
  return {
    data: null,
    error: lastError?.message || 'Failed to load weekly chart data after multiple attempts'
  };
};