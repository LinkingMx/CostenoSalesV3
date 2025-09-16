/**
 * Custom Sales Comparison Service
 * Service for fetching and processing custom date range sales data
 * Used specifically for custom date ranges that don't match standard patterns
 */

import type { SalesCustomData } from '@/components/custom-sales-comparison/types';
import { formatDateForCustomCard, getDayName } from '@/components/custom-sales-comparison/utils/formatting';
import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import { cacheManager, generateCacheKey } from './cache';
import { dateFromApiString, formatDateForApi } from './main-dashboard.service';
import { MainDashboardApiResponse, MainDashboardRequest } from './types';

// Track active requests to prevent duplicate calls
const activeRequests = new Map<string, Promise<{ data: SalesCustomData[]; totalSales: number; error?: string }>>();

// Rate limiting configuration
const RATE_LIMIT = {
    maxRequestsPerMinute: 8,
    windowMs: 60 * 1000, // 1 minute in milliseconds
    requestCounts: new Map<string, { count: number; resetTime: number }>(),
};

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
 * Generate array of dates within the custom range
 */
const generateCustomRangeDates = (startDate: string, endDate: string): Date[] => {
    const dates: Date[] = [];
    const current = dateFromApiString(startDate);
    const end = dateFromApiString(endDate);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
};

/**
 * Process API response for a single date into SalesCustomData format
 */
const processSingleDateData = (date: Date, apiResponse: MainDashboardApiResponse | null, isInRange: boolean = true): SalesCustomData => {
    const totalSales = apiResponse?.success && apiResponse.data?.sales?.total ? apiResponse.data.sales.total : 0;

    return {
        date,
        amount: totalSales,
        isInRange,
        dayName: getDayName(date),
        formattedDate: formatDateForCustomCard(date),
    };
};

/**
 * Fetch sales data for a single date
 */
const fetchSingleDateData = async (date: Date): Promise<MainDashboardApiResponse | null> => {
    try {
        const dateStr = formatDateForApi(date);
        const request: MainDashboardRequest = {
            start_date: dateStr,
            end_date: dateStr,
        };

        const response = await apiPost<MainDashboardApiResponse>(API_ENDPOINTS.MAIN_DASHBOARD, request);

        return response.data;
    } catch (error) {
        console.warn(`Failed to fetch data for date ${date.toISOString()}:`, error);
        return null;
    }
};

/**
 * Fetch custom sales comparison data from API for the specified date range
 * Makes individual API calls for each day in the range to get accurate daily totals
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export const fetchCustomSalesComparisonData = async (
    startDate: string,
    endDate: string,
): Promise<{ data: SalesCustomData[]; totalSales: number; error?: string }> => {
    // Generate cache key
    const cacheKey = generateCacheKey('custom-sales-comparison', startDate, endDate);

    // Check cache first
    const cachedData = cacheManager.get<{ data: SalesCustomData[]; totalSales: number }>(cacheKey);
    if (cachedData) {
        if (process.env.NODE_ENV === 'development') {
            console.log('📦 Returning cached custom sales comparison data for:', cacheKey);
        }
        return cachedData;
    }

    // Check if there's already an active request for this data
    const activeRequest = activeRequests.get(cacheKey);
    if (activeRequest) {
        if (process.env.NODE_ENV === 'development') {
            console.log('⏳ Reusing active request for custom sales comparison:', cacheKey);
        }
        return activeRequest;
    }

    // Check rate limiting
    if (!isWithinRateLimit(cacheKey)) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('🚫 Rate limit exceeded for custom sales comparison:', cacheKey);
        }
        return {
            data: [],
            totalSales: 0,
            error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.',
        };
    }

    // Create new request promise
    const requestPromise = (async () => {
        try {
            console.log('🚀 FETCHING CUSTOM SALES COMPARISON DATA:', { startDate, endDate });

            // Generate all dates in the range
            const datesInRange = generateCustomRangeDates(startDate, endDate);

            if (process.env.NODE_ENV === 'development') {
                console.log('📅 Generated dates for custom range:', {
                    startDate,
                    endDate,
                    dateCount: datesInRange.length,
                    firstDate: datesInRange[0],
                    lastDate: datesInRange[datesInRange.length - 1],
                });
            }

            // Fetch data for each date with concurrency limit to avoid overwhelming the API
            const MAX_CONCURRENT_REQUESTS = 3;
            const salesData: SalesCustomData[] = [];

            for (let i = 0; i < datesInRange.length; i += MAX_CONCURRENT_REQUESTS) {
                const batch = datesInRange.slice(i, i + MAX_CONCURRENT_REQUESTS);

                const batchPromises = batch.map(async (date) => {
                    const apiResponse = await fetchSingleDateData(date);
                    return processSingleDateData(date, apiResponse, true);
                });

                const batchResults = await Promise.all(batchPromises);
                salesData.push(...batchResults);

                // Small delay between batches to be respectful to the API
                if (i + MAX_CONCURRENT_REQUESTS < datesInRange.length) {
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
            }

            // Calculate total sales across all days
            const totalSales = salesData.reduce((sum, day) => sum + day.amount, 0);

            if (process.env.NODE_ENV === 'development') {
                console.log('🔍 CUSTOM SALES COMPARISON PROCESSED DATA:', {
                    dateRange: `${startDate} to ${endDate}`,
                    dayCount: salesData.length,
                    totalSales,
                    averageDaily: salesData.length > 0 ? totalSales / salesData.length : 0,
                    sampleDay: salesData[0],
                    allDailyTotals: salesData.map((d) => ({ date: d.formattedDate, amount: d.amount })),
                });
            }

            const result = { data: salesData, totalSales };

            // Cache the processed data (15 minutes TTL for custom ranges due to multiple API calls)
            cacheManager.set(cacheKey, result, { ttl: 15 * 60 * 1000 });

            // Remove from active requests
            activeRequests.delete(cacheKey);

            return result;
        } catch (error) {
            const apiError = error as ApiError;

            console.error('Failed to fetch custom sales comparison data:', apiError);

            // Remove from active requests
            activeRequests.delete(cacheKey);

            // Return error state
            return {
                data: [],
                totalSales: 0,
                error: apiError.message || 'Failed to load custom sales comparison data',
            };
        }
    })();

    // Store the promise in active requests
    activeRequests.set(cacheKey, requestPromise);

    return requestPromise;
};

/**
 * Validate date range for custom sales comparison
 */
export const isValidCustomDateRange = (startDate: string, endDate: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false;
    }

    // Custom ranges should be at least 2 days but not more than 365 days
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff >= 1 && daysDiff <= 365 && start <= end;
};

/**
 * Clear custom sales comparison cache
 */
export const clearCustomSalesComparisonCache = (startDate?: string, endDate?: string): void => {
    if (startDate && endDate) {
        const cacheKey = generateCacheKey('custom-sales-comparison', startDate, endDate);
        cacheManager.delete(cacheKey);
        activeRequests.delete(cacheKey);
    } else {
        // Clear all custom sales comparison cache entries
        // Note: This is a simplified approach for demonstration
        cacheManager.clear();
        activeRequests.clear();
    }
};

/**
 * Retry failed request with exponential backoff
 */
export const fetchCustomSalesComparisonWithRetry = async (
    startDate: string,
    endDate: string,
    maxRetries: number = 2,
    initialDelay: number = 1000,
): Promise<{ data: SalesCustomData[]; totalSales: number; error?: string }> => {
    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;

                if (process.env.NODE_ENV === 'development') {
                    console.log(`Retry attempt ${attempt} for custom sales comparison: ${startDate} - ${endDate}`);
                }
            }

            return await fetchCustomSalesComparisonData(startDate, endDate);
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                console.error('All retry attempts failed for custom sales comparison:', lastError);
                break;
            }
        }
    }

    return {
        data: [],
        totalSales: 0,
        error: lastError?.message || 'Failed to load custom sales comparison data after multiple attempts',
    };
};
