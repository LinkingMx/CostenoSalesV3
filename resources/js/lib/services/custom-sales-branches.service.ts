/**
 * Custom Sales Branches Service
 * Service for fetching and processing custom date range branch sales data
 * Used specifically for custom date ranges that don't match standard patterns
 */

import type { BranchCustomSalesData } from '@/components/custom-sales-branches/types';
import { logger } from '@/components/custom-sales-branches/lib/logger';
import { apiPost } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiError } from '../api/types';
import { cacheManager, generateCacheKey } from './cache';
import { dateFromApiString, formatDateForApi } from './main-dashboard.service';
import { MainDashboardApiResponse, MainDashboardRequest } from './types';

// Interface for API branch data structure
interface ApiBranchData {
    store_id: number;
    open_accounts: {
        money: number;
        total: number;
    };
    closed_ticket: {
        money: number;
        total: number;
    };
    average_ticket?: number;
    brand?: string;
    region?: string;
}

// Interface for aggregated API cards data
interface ApiCardsData {
    [branchName: string]: ApiBranchData;
}

// Track active requests to prevent duplicate calls
const activeRequests = new Map<string, Promise<{ data: BranchCustomSalesData[]; error?: string }>>();

// Rate limiting configuration
const RATE_LIMIT = {
    maxRequestsPerMinute: 10,
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
 * Transform API cards data to BranchCustomSalesData format
 */
const transformApiCardsToBranchData = (cardsData: ApiCardsData): BranchCustomSalesData[] => {
    if (!cardsData || typeof cardsData !== 'object') {
        logger.warn('Invalid cardsData provided');
        return [];
    }

    try {
        return Object.entries(cardsData)
            .map(([branchName, apiData]: [string, ApiBranchData]) => {
                // Validate required data structure
                if (!apiData || typeof apiData !== 'object') {
                    logger.warn(`Invalid branch data for ${branchName}`);
                    return null;
                }

                const { store_id, open_accounts, closed_ticket, average_ticket, brand, region } = apiData;

                // Validate required fields
                if (store_id === undefined || store_id === null || !open_accounts || !closed_ticket) {
                    logger.warn(`Missing required fields for ${branchName}`, {
                        store_id: store_id?.toString(),
                        hasOpenAccounts: !!open_accounts,
                        hasClosedTicket: !!closed_ticket,
                    });
                    return null;
                }

                // Calculate totals
                const openAccountsAmount = open_accounts.money || 0;
                const closedAccountsAmount = closed_ticket.money || 0;
                const totalSales = openAccountsAmount + closedAccountsAmount;

                // Calculate total tickets
                const openTickets = open_accounts.total || 0;
                const closedTickets = closed_ticket.total || 0;
                const totalTickets = openTickets + closedTickets;

                // Generate avatar from brand or branch name
                let avatar = 'B'; // Default
                if (brand && typeof brand === 'string') {
                    avatar = brand.charAt(0).toUpperCase();
                } else {
                    avatar = branchName.charAt(0).toUpperCase();
                }

                // Debug log for store_id transformation
                logger.debug('Transforming store_id', {
                    store_id: store_id.toString(),
                    type: typeof store_id,
                    branchName,
                });

                const transformedBranch: BranchCustomSalesData = {
                    id: store_id.toString(),
                    name: branchName,
                    totalSales,
                    percentage: 0, // Not used, will be removed from UI
                    openAccounts: openAccountsAmount,
                    closedSales: closedAccountsAmount,
                    averageTicket: average_ticket || 0,
                    totalTickets,
                    avatar,
                };

                // Add location if provided
                if (region && typeof region === 'string') {
                    transformedBranch.location = region;
                }

                return transformedBranch;
            })
            .filter((branch): branch is BranchCustomSalesData => branch !== null)
            .sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales descending
    } catch (error) {
        logger.error('Transformation error:', error);
        return [];
    }
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
        logger.warn(`Failed to fetch data for date ${date.toISOString()}:`, error);
        return null;
    }
};

/**
 * Fetch custom sales branches data from API for the specified date range
 * Makes individual API calls for each day in the range to get accurate daily totals
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export const fetchCustomSalesBranchesData = async (
    startDate: string,
    endDate: string,
): Promise<{ data: BranchCustomSalesData[]; error?: string }> => {
    // Generate cache key
    const cacheKey = generateCacheKey('custom-sales-branches', startDate, endDate);

    // Check cache first
    const cachedData = cacheManager.get<{ data: BranchCustomSalesData[] }>(cacheKey);
    if (cachedData) {
        logger.debug('Returning cached custom sales branches data', { cacheKey });
        return cachedData;
    }

    // Check if there's already an active request for this data
    const activeRequest = activeRequests.get(cacheKey);
    if (activeRequest) {
        logger.debug('Reusing active request for custom sales branches', { cacheKey });
        return activeRequest;
    }

    // Check rate limiting
    if (!isWithinRateLimit(cacheKey)) {
        logger.warn('Rate limit exceeded for custom sales branches', { cacheKey });
        return {
            data: [],
            error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.',
        };
    }

    // Create new request promise
    const requestPromise = (async () => {
        try {
            logger.debug('Fetching custom sales branches data', { startDate, endDate });

            // Generate all dates in the range
            const datesInRange = generateCustomRangeDates(startDate, endDate);

            logger.debug('Generated dates for custom range', {
                startDate,
                endDate,
                dateCount: datesInRange.length,
            });

            // Fetch data for each date with concurrency limit to avoid overwhelming the API
            const MAX_CONCURRENT_REQUESTS = 3;
            const allBranchesMap = new Map<string, ApiBranchData>();

            for (let i = 0; i < datesInRange.length; i += MAX_CONCURRENT_REQUESTS) {
                const batch = datesInRange.slice(i, i + MAX_CONCURRENT_REQUESTS);

                const batchPromises = batch.map(async (date) => {
                    const apiResponse = await fetchSingleDateData(date);
                    return { date, apiResponse };
                });

                const batchResults = await Promise.all(batchPromises);

                // Process each day's data
                batchResults.forEach(({ apiResponse }) => {
                    if (apiResponse?.success && apiResponse.data?.cards) {
                        // Aggregate branches data
                        Object.entries(apiResponse.data.cards).forEach(([branchName, branchData]: [string, ApiBranchData]) => {
                            if (!allBranchesMap.has(branchName)) {
                                allBranchesMap.set(branchName, {
                                    ...branchData,
                                    open_accounts: { ...branchData.open_accounts },
                                    closed_ticket: { ...branchData.closed_ticket },
                                });
                            } else {
                                const existing = allBranchesMap.get(branchName);
                                if (existing) {
                                    // Aggregate the amounts
                                    existing.open_accounts.money += branchData.open_accounts?.money || 0;
                                    existing.open_accounts.total += branchData.open_accounts?.total || 0;
                                    existing.closed_ticket.money += branchData.closed_ticket?.money || 0;
                                    existing.closed_ticket.total += branchData.closed_ticket?.total || 0;

                                    // Update average ticket (this is a simple average, could be weighted)
                                    const currentAverage = existing.average_ticket || 0;
                                    const newAverage = branchData.average_ticket || 0;
                                    existing.average_ticket = (currentAverage + newAverage) / 2;
                                }
                            }
                        });
                    }
                });

                // Small delay between batches to be respectful to the API
                if (i + MAX_CONCURRENT_REQUESTS < datesInRange.length) {
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
            }

            // Transform aggregated data
            const cardsObject = Object.fromEntries(allBranchesMap);
            const transformedData = transformApiCardsToBranchData(cardsObject);

            logger.info(`Transformed ${transformedData.length} branches from API data`, {
                branchCount: transformedData.length,
                dateRange: `${startDate} to ${endDate}`,
            });

            const result = { data: transformedData };

            // Cache the processed data (15 minutes TTL for custom ranges due to multiple API calls)
            cacheManager.set(cacheKey, result, { ttl: 15 * 60 * 1000 });

            // Remove from active requests
            activeRequests.delete(cacheKey);

            return result;
        } catch (error) {
            const apiError = error as ApiError;

            logger.error('Failed to fetch custom sales branches data:', apiError);

            // Remove from active requests
            activeRequests.delete(cacheKey);

            // Return error state
            return {
                data: [],
                error: apiError.message || 'Failed to load custom sales branches data',
            };
        }
    })();

    // Store the promise in active requests
    activeRequests.set(cacheKey, requestPromise);

    return requestPromise;
};

/**
 * Validate date range for custom sales branches
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
 * Clear custom sales branches cache
 */
export const clearCustomSalesBranchesCache = (startDate?: string, endDate?: string): void => {
    if (startDate && endDate) {
        const cacheKey = generateCacheKey('custom-sales-branches', startDate, endDate);
        cacheManager.delete(cacheKey);
        activeRequests.delete(cacheKey);
    } else {
        // Clear all custom sales branches cache entries
        // Note: This is a simplified approach for demonstration
        cacheManager.clear();
        activeRequests.clear();
    }
};

/**
 * Retry failed request with exponential backoff
 */
export const fetchCustomSalesBranchesWithRetry = async (
    startDate: string,
    endDate: string,
    maxRetries: number = 2,
    initialDelay: number = 1000,
): Promise<{ data: BranchCustomSalesData[]; error?: string }> => {
    let lastError: Error | null = null;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;

                logger.debug(`Retry attempt ${attempt} for custom sales branches: ${startDate} - ${endDate}`);
            }

            return await fetchCustomSalesBranchesData(startDate, endDate);
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                logger.error('All retry attempts failed for custom sales branches:', lastError);
                break;
            }
        }
    }

    return {
        data: [],
        error: lastError?.message || 'Failed to load custom sales branches data after multiple attempts',
    };
};