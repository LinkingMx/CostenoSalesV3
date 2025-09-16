/**
 * Hours Chart Service
 * Service for fetching and processing hourly sales data
 */

import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import { logger } from '../../components/daily-chart-comparison/lib/logger';
import { cacheManager, generateCacheKey } from './cache';
import { HoursChartApiResponse, HoursChartRequest, ProcessedChartData, ProcessedDayData } from './types';

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
 * Process API response into chart-ready data
 */
const processApiResponse = (response: HoursChartApiResponse): ProcessedChartData => {
    // Handle the actual API response structure: { success: true, data: { "2025-09-13": amount, ... } }
    let salesData: any = response.data;

    // Check if response.data has the expected structure with nested data object
    if (response.data && typeof response.data === 'object') {
        // If it's an object with success and data properties
        if ('success' in response.data && 'data' in response.data && typeof response.data.data === 'object' && response.data.data !== null) {
            salesData = response.data.data;
        }
    }

    if (!salesData || typeof salesData !== 'object') {
        return {
            days: [],
            isEmpty: true,
            hasError: false,
        };
    }

    const dateEntries = Object.entries(salesData)
        .map(([dateKey, hoursObject]) => {
            // Sum all hourly values to get daily total
            let dailyTotal = 0;

            if (typeof hoursObject === 'object' && hoursObject !== null) {
                // Sum all numeric values in the hours object
                dailyTotal = Object.values(hoursObject)
                    .filter((value) => typeof value === 'number')
                    .reduce((sum, value) => sum + value, 0);
            }

            return [dateKey, dailyTotal] as [string, number];
        })
        .filter(([, amount]) => amount > 0); // Only process entries with positive amounts
    // NO SORTING - API already provides correct order
    // NO SLICING - API already provides correct number of days

    // Process each day's data
    const processedDays: ProcessedDayData[] = dateEntries.map(([dateStr, amount]) => {
        // Parse date from string "2025-09-13" without timezone issues
        const [, month, day] = dateStr.split('-');
        const monthNames = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const monthName = monthNames[parseInt(month)] || 'mes';
        const chartLabel = `${monthName}. ${parseInt(day)}`;

        return {
            label: chartLabel, // Direct string parsing - no Date objects
            date: dateStr,
            total: amount as number,
        };
    });

    // Check if all totals are zero
    const isEmpty = processedDays.every((day) => day.total === 0);

    return {
        days: processedDays,
        isEmpty,
        hasError: false,
    };
};

/**
 * Fetch hours chart data from API
 */
export const fetchHoursChartData = async (date: string): Promise<ProcessedChartData> => {
    // Generate cache key
    const cacheKey = generateCacheKey('hours-chart', date);

    // Check cache first
    const cachedData = cacheManager.get<ProcessedChartData>(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    try {
        // Prepare request
        const request: HoursChartRequest = { date };

        logger.debug('🚀 FETCHING API DATA FOR DATE:', { date, request });

        // Make API call
        const response = await apiPost<HoursChartApiResponse>(API_ENDPOINTS.HOURS_CHART, request);

        // Process response
        const processedData = processApiResponse(response.data);

        // Cache the processed data (20 minutes TTL)
        cacheManager.set(cacheKey, processedData);

        return processedData;
    } catch (error) {
        const apiError = error as ApiError;

        logger.error('Failed to fetch hours chart data:', apiError);

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
export const fetchWithRetry = async (date: string, maxRetries: number = 3, initialDelay: number = 1000): Promise<ProcessedChartData> => {
    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                // Wait before retry
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff

                if (process.env.NODE_ENV === 'development') {
                    logger.debug(`Retry attempt ${attempt} for date: ${date}`);
                }
            }

            return await fetchHoursChartData(date);
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                logger.error('All retry attempts failed:', lastError);
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
