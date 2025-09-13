/**
 * Hours Chart Service
 * Service for fetching and processing hourly sales data
 */

import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import {
  HoursChartRequest,
  HoursChartApiResponse,
  DayData,
  ProcessedDayData,
  ProcessedChartData,
} from './types';
import { cacheManager, generateCacheKey } from './cache';

// Removed DAY_LABELS - now using real API dates for labels

/**
 * Parse date string safely to avoid timezone issues
 * When parsing "YYYY-MM-DD" without time, JS interprets as UTC midnight
 * which can shift to previous day in local timezone.
 * This function ensures the date is parsed in local timezone.
 */
export const parseLocalDate = (dateStr: string): Date => {
  // Add explicit time to ensure local timezone parsing
  return new Date(dateStr + 'T00:00:00');
};

/**
 * Calculate total from hourly data
 */
const calculateDayTotal = (dayData: DayData): number => {
  if (!dayData.hours || !Array.isArray(dayData.hours)) {
    return 0;
  }

  return dayData.hours.reduce((total, hour) => {
    const value = typeof hour.value === 'number' ? hour.value : 0;
    return total + value;
  }, 0);
};

/**
 * Process API response into chart-ready data
 */
const processApiResponse = (response: HoursChartApiResponse): ProcessedChartData => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 processApiResponse: Input response', {
      response,
      hasData: !!response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataKeys: response.data ? Object.keys(response.data) : [],
      firstElement: Array.isArray(response.data) ? response.data[0] : null,
      rawData: response.data
    });
  }

  // Handle the actual API response structure: { success: true, data: { "2025-09-13": amount, ... } }
  let salesData: any = response.data;

  // Check if response.data has the expected structure with nested data object
  if (response.data && typeof response.data === 'object') {
    // If it's an object with success and data properties
    if ('success' in response.data && 'data' in response.data && typeof response.data.data === 'object' && response.data.data !== null) {
      salesData = response.data.data;
      if (process.env.NODE_ENV === 'development') {
        console.log('processApiResponse: Using nested data object from API response', salesData);
      }
    } else if (!Array.isArray(response.data)) {
      // Direct data object (dates as keys, amounts as values)
      if (process.env.NODE_ENV === 'development') {
        console.log('processApiResponse: Using direct data object', salesData);
      }
    }
  }

  if (!salesData || typeof salesData !== 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.log('processApiResponse: Invalid data structure, returning empty days');
    }
    return {
      days: [],
      isEmpty: true,
      hasError: false,
    };
  }

  // Convert the date-hourly data object to array format with daily totals
  // API already returns the correct dates in the correct order - NO SORTING/SLICING needed
  const dateEntries = Object.entries(salesData)
    .map(([dateKey, hoursObject]) => {
      // Sum all hourly values to get daily total
      let dailyTotal = 0;

      if (typeof hoursObject === 'object' && hoursObject !== null) {
        // Sum all numeric values in the hours object
        dailyTotal = Object.values(hoursObject)
          .filter(value => typeof value === 'number')
          .reduce((sum, value) => sum + value, 0);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 processApiResponse: Processing ${dateKey}`, {
          hoursObject,
          hoursCount: Object.keys(hoursObject || {}).length,
          dailyTotal,
          firstFewHours: Object.entries(hoursObject || {}).slice(0, 3)
        });
      }

      return [dateKey, dailyTotal] as [string, number];
    })
    .filter(([key, amount]) => amount > 0); // Only process entries with positive amounts
    // NO SORTING - API already provides correct order
    // NO SLICING - API already provides correct number of days

  if (process.env.NODE_ENV === 'development') {
    console.log('📅 processApiResponse: Date entries extracted', {
      entriesCount: dateEntries.length,
      dateEntries: dateEntries.map(([date, amount]) => ({
        date,
        amount,
        dayOfWeek: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
        dayMonth: new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      }))
    });
  }

  // Process each day's data
  const processedDays: ProcessedDayData[] = dateEntries.map(([dateStr, amount], index) => {
    // Use safe date parsing to avoid timezone issues
    const date = parseLocalDate(dateStr);
    const shortMonthName = date.toLocaleDateString('es-ES', { month: 'short' });
    const day = date.getDate();
    // Spanish format: "sep. 13" instead of "Sep 13"
    const chartLabel = `${shortMonthName.toLowerCase()}. ${day}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ processApiResponse: Processing day ${index}`, {
        dateStr,
        amount,
        parsedDate: date,
        formattedLabel: chartLabel,
        dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('es-ES')
      });
    }

    return {
      label: chartLabel, // Use real API date instead of generic labels
      date: dateStr,
      total: amount as number,
    };
  });

  // Check if all totals are zero
  const isEmpty = processedDays.every(day => day.total === 0);

  return {
    days: processedDays,
    isEmpty,
    hasError: false,
  };
};

/**
 * Fetch hours chart data from API
 */
export const fetchHoursChartData = async (
  date: string
): Promise<ProcessedChartData> => {
  // Generate cache key
  const cacheKey = generateCacheKey('hours-chart', date);

  // Check cache first
  const cachedData = cacheManager.get<ProcessedChartData>(cacheKey);
  if (cachedData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Using cached hours chart data for date:', date);
    }
    return cachedData;
  }

  try {
    // Prepare request
    const request: HoursChartRequest = { date };

    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Fetching hours chart data:', request);
    }

    // Make API call
    const response = await apiPost<HoursChartApiResponse>(
      API_ENDPOINTS.HOURS_CHART,
      request
    );

    // Process response
    const processedData = processApiResponse(response.data);

    // Cache the processed data (20 minutes TTL)
    cacheManager.set(cacheKey, processedData);

    return processedData;
  } catch (error) {
    const apiError = error as ApiError;
    
    console.error('Failed to fetch hours chart data:', apiError);

    // Return error state
    return {
      days: [],
      isEmpty: false,
      hasError: true,
    };
  }
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
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
 * Clear hours chart cache
 */
export const clearHoursChartCache = (date?: string): void => {
  if (date) {
    const cacheKey = generateCacheKey('hours-chart', date);
    cacheManager.delete(cacheKey);
  } else {
    // Clear all hours chart cache entries
    // This is a simplified approach - in production you might want
    // to track keys or use a more sophisticated cache
    cacheManager.clear();
  }
};

/**
 * Retry failed request with exponential backoff
 */
export const fetchWithRetry = async (
  date: string,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<ProcessedChartData> => {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Retry attempt ${attempt} for date: ${date}`);
        }
      }

      return await fetchHoursChartData(date);
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
    days: [],
    isEmpty: false,
    hasError: true,
  };
};