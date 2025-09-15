/**
 * Monthly Chart Service
 * Service for fetching and processing monthly chart comparison data from main dashboard API
 */

import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import { cacheManager, generateCacheKey } from './cache';
import type { MonthlyChartData } from '@/components/monthly-chart-comparison/types';

// Track active requests to prevent duplicate calls
const activeRequests = new Map<string, Promise<unknown>>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 8,
  windowMs: 60 * 1000, // 1 minute in milliseconds
  requestCounts: new Map<string, { count: number; resetTime: number }>(),
};

/**
 * API request interface for monthly chart data
 */
interface MonthlyChartRequest {
  start_date: string;
  end_date: string;
  range: 'month';
}

/**
 * API response interface for main dashboard data
 */
interface MonthlyChartApiResponse {
  success: boolean;
  message: string;
  data: {
    sales: {
      total: number;
      subtotal: number;
    };
    cards: Record<string, unknown>; // Branch data not needed for chart
    range: {
      actual: number;    // Current month total
      last: number;      // Previous month total
      two_las: number;   // Two months ago total
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
 * Spanish month names for chart
 */
const SPANISH_MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];


/**
 * Generate Spanish date range labels for months
 */
const generateMonthLabels = (startDate: string): string[] => {
  // Parse dates as local dates to avoid timezone conversion issues
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const date = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const labels: string[] = [];

  // Current month (selected month)
  labels.push(`${SPANISH_MONTH_NAMES[currentMonth]} ${currentYear}`);

  // Previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  labels.push(`${SPANISH_MONTH_NAMES[prevMonth]} ${prevYear}`);

  // Two months ago
  const twoMonthsAgoMonth = prevMonth === 0 ? 11 : prevMonth - 1;
  const twoMonthsAgoYear = prevMonth === 0 ? prevYear - 1 : prevYear;
  labels.push(`${SPANISH_MONTH_NAMES[twoMonthsAgoMonth]} ${twoMonthsAgoYear}`);

  return labels;
};


/**
 * Process API response into monthly chart data format
 */
const processApiResponse = (response: MonthlyChartApiResponse, startDate: string): MonthlyChartData => {
  if (!response.success || !response.data?.range) {
    console.warn('Monthly Chart API: Invalid response structure', response);
    throw new Error('Invalid API response structure');
  }

  const { actual, last, two_las } = response.data.range;

  const labels = generateMonthLabels(startDate);

  // Debug logging
  console.log('📊 Monthly Chart Data Processing:', {
    startDate,
    apiData: { actual, last, two_las },
    generatedLabels: labels,
    finalLabels: [labels[2], labels[1], labels[0]],
    finalValues: [two_las, last, actual]
  });

  return {
    monthLabels: [labels[2], labels[1], labels[0]], // Order: Julio, Agosto, Septiembre
    monthValues: [two_las, last, actual], // Order: July value, August value, September value
    monthColors: ['#4a3d2f', '#6b5d4a', '#897053'], // Colors for July, August, September
    legendLabels: ['Hace 2 meses', 'Mes anterior', 'Mes actual'], // Legend labels
  };
};

/**
 * Fetch monthly chart data from API
 *
 * @param startDate - Start date of the month in YYYY-MM-DD format (first day)
 * @param endDate - End date of the month in YYYY-MM-DD format (last day)
 */
export const fetchMonthlyChartData = async (
  startDate: string,
  endDate: string
): Promise<{ data: MonthlyChartData | null; error?: string }> => {
  // Generate cache key
  const cacheKey = generateCacheKey('monthly-chart', startDate, endDate);

  // Check cache first
  const cachedData = cacheManager.get<{ data: MonthlyChartData | null }>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Check if there's already an active request for this data
  const activeRequest = activeRequests.get(cacheKey);
  if (activeRequest) {
    return activeRequest as Promise<{ data: MonthlyChartData | null; error?: string }>;
  }

  // Check rate limiting before making request
  if (!isWithinRateLimit(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 Rate limit exceeded for monthly chart:', cacheKey);
    }
    return {
      data: null,
      error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.'
    };
  }

  // Create new request promise
  const requestPromise = (async () => {
    try {
      const request: MonthlyChartRequest = {
        start_date: startDate,
        end_date: endDate,
        range: 'month'
      };

      // Make API call using the main dashboard endpoint
      const response = await apiPost<MonthlyChartApiResponse>(
        API_ENDPOINTS.MAIN_DASHBOARD,
        request
      );

      // Process response into chart format
      const chartData = processApiResponse(response.data, startDate);

      const result = { data: chartData };

      // Cache the processed data (15 minutes TTL for chart data)
      cacheManager.set(cacheKey, result, { ttl: 15 * 60 * 1000 });

      // Remove from active requests
      activeRequests.delete(cacheKey);

      return result;
    } catch (error) {
      const apiError = error as ApiError;

      console.error('Failed to fetch monthly chart data:', apiError);

      // Remove from active requests
      activeRequests.delete(cacheKey);

      // Return error state
      return {
        data: null,
        error: apiError.message || 'Failed to load monthly chart data'
      };
    }
  })();

  // Store the promise in active requests
  activeRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

/**
 * Validate date range for monthly chart API request
 */
export const isValidMonthlyChartDateRange = (startDate: string, endDate: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return false;
  }

  // Parse dates as local dates to avoid timezone conversion issues
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const start = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
  const end = new Date(endYear, endMonth - 1, endDay);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  // Check if start date is the first day of the month
  if (start.getDate() !== 1) {
    return false;
  }

  // Check if end date is the last day of the month
  const lastDayOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  if (end.getDate() !== lastDayOfMonth.getDate()) {
    return false;
  }

  // Check if both dates are in the same month
  if (start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear()) {
    return false;
  }

  return true;
};

/**
 * Format date to API format (YYYY-MM-DD)
 * Uses local date components to avoid timezone conversion issues
 */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Clear monthly chart cache
 */
export const clearMonthlyChartCache = (startDate?: string, endDate?: string): void => {
  if (startDate && endDate) {
    const cacheKey = generateCacheKey('monthly-chart', startDate, endDate);
    cacheManager.delete(cacheKey);
    activeRequests.delete(cacheKey);
  } else {
    // Clear all monthly chart cache entries by clearing the full cache
    // In production, you might want to be more selective
    cacheManager.clear();
    activeRequests.clear();
  }
};

/**
 * Fetch raw monthly data from API (returns unprocessed API response)
 */
export const fetchRawMonthlyData = async (
  startDate: string,
  endDate: string
): Promise<{ data: MonthlyChartApiResponse | null; rawData?: MonthlyChartApiResponse; error?: string }> => {
  // Generate cache key
  const cacheKey = generateCacheKey('monthly-raw', startDate, endDate);

  // Debug logging for tracking API calls
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 fetchRawMonthlyData: Called for ${startDate} to ${endDate}`);
  }

  // Check cache first
  const cachedData = cacheManager.get<{ data: MonthlyChartApiResponse | null; rawData?: MonthlyChartApiResponse }>(cacheKey);
  if (cachedData) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ fetchRawMonthlyData: Returning cached data for ${startDate} to ${endDate}`);
    }
    return cachedData;
  }

  // Check if there's already an active request for this data
  const activeRequest = activeRequests.get(cacheKey);
  if (activeRequest) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏳ fetchRawMonthlyData: Returning active request for ${startDate} to ${endDate}`);
    }
    return activeRequest as Promise<{ data: MonthlyChartApiResponse | null; rawData?: MonthlyChartApiResponse; error?: string }>;
  }

  // Check rate limiting before making request
  if (!isWithinRateLimit(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 Rate limit exceeded for raw monthly data:', cacheKey);
    }
    return {
      data: null,
      error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.'
    };
  }

  // Create the request promise and store it immediately to prevent duplicate calls
  const requestPromise = (async () => {
    try {
      const request: MonthlyChartRequest = {
        start_date: startDate,
        end_date: endDate,
        range: 'month'
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 fetchRawMonthlyData: Making actual API call to ${API_ENDPOINTS.MAIN_DASHBOARD} for ${startDate} to ${endDate}`);
      }

      // Make API call using the main dashboard endpoint
      const response = await apiPost<MonthlyChartApiResponse>(
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

      console.error('Failed to fetch raw monthly data:', apiError);

      // Remove from active requests
      activeRequests.delete(cacheKey);

      // Return error state
      return {
        data: null,
        error: apiError.message || 'Failed to load raw monthly data'
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
export const fetchMonthlyChartWithRetry = async (
  startDate: string,
  endDate: string,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<{ data: MonthlyChartData | null; rawData?: MonthlyChartApiResponse; error?: string }> => {
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
      const rawResult = await fetchRawMonthlyData(startDate, endDate);

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
      const chartData = processApiResponse(rawResult.data, startDate);

      return {
        data: chartData,
        rawData: rawResult.rawData || rawResult.data
      };
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        console.error('All monthly chart retry attempts failed:', lastError);
        break;
      }
    }
  }

  // Return error state after all retries failed
  return {
    data: null,
    error: lastError?.message || 'Failed to load monthly chart data after multiple attempts'
  };
};