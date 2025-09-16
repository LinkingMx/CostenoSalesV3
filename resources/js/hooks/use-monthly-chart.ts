/**
 * Monthly Chart Hook
 * Custom hook for managing monthly chart data with API integration, caching, and error handling
 */

import type { DateRange } from '@/components/main-filter-calendar';
import type { MonthlyChartData } from '@/components/monthly-chart-comparison/types';
import { isCompleteMonthSelected } from '@/components/monthly-chart-comparison/utils';
import {
    clearMonthlyChartCache,
    fetchMonthlyChartWithRetry,
    formatDateForApi,
    isValidMonthlyChartDateRange,
} from '@/lib/services/monthly-chart.service';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMonthlyChartOptions {
    enableRetry?: boolean;
    maxRetries?: number;
    debounceMs?: number;
}

interface UseMonthlyChartReturn {
    data: MonthlyChartData | null;
    rawApiData: unknown | null; // Raw API response data
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
    isValidForMonthlyChart: boolean;
}

/**
 * Custom hook for monthly chart data management
 * Provides API integration, caching, loading states, and error handling
 */
export const useMonthlyChart = (selectedDateRange: DateRange | undefined, options: UseMonthlyChartOptions = {}): UseMonthlyChartReturn => {
    const {
        enableRetry = true,
        maxRetries = 3,
        debounceMs = 300,
    } = options;

    const [data, setData] = useState<MonthlyChartData | null>(null);
    const [rawApiData, setRawApiData] = useState<unknown | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track if component is mounted to prevent state updates after unmount
    const isMountedRef = useRef(true);

    // Track the current request to prevent race conditions
    const currentRequestRef = useRef<string | null>(null);

    // Debounce timer for API calls
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Track active effect to prevent React 19 double execution
    const activeEffectRef = useRef<string | null>(null);

    // Check if the selected date range is valid for monthly chart
    const isValidForMonthlyChart = isCompleteMonthSelected(selectedDateRange);

    /**
     * Convert DateRange to API format strings
     */
    const getApiDateStrings = useCallback((dateRange: DateRange): { startDate: string; endDate: string } | null => {
        if (!dateRange?.from || !dateRange?.to) {
            return null;
        }

        const startDate = formatDateForApi(dateRange.from);
        const endDate = formatDateForApi(dateRange.to);

        console.log('Monthly chart date conversion debug:', {
            originalFrom: dateRange.from,
            originalTo: dateRange.to,
            startDate,
            endDate,
        });

        if (!isValidMonthlyChartDateRange(startDate, endDate)) {
            console.log('Monthly chart service validation failed for:', { startDate, endDate });
            return null;
        }

        console.log('Monthly chart service validation passed for:', { startDate, endDate });
        return { startDate, endDate };
    }, []);

    /**
     * Fetch data from API with loading management
     */
    const fetchData = useCallback(
        async (dateRange: DateRange, requestId: string) => {
            const apiDates = getApiDateStrings(dateRange);
            if (!apiDates) {
                if (isMountedRef.current) {
                    setError('Invalid date range for monthly chart');
                    setIsLoading(false);
                }
                return;
            }

            const { startDate, endDate } = apiDates;

            // Debug logging to track API calls
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔍 useMonthlyChart: Starting fetchData for ${startDate} to ${endDate} (Request ID: ${requestId})`);
                console.trace('Call stack trace');
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch data with or without retry based on options
                const result = enableRetry
                    ? await fetchMonthlyChartWithRetry(startDate, endDate, maxRetries)
                    : await fetchMonthlyChartWithRetry(startDate, endDate, 0); // No retries

                // Check if this request is still current (prevent race conditions)
                if (currentRequestRef.current !== requestId || !isMountedRef.current) {
                    return;
                }


                if (result.error) {
                    setError(result.error);
                    setData(null);
                    setRawApiData(null);
                } else {
                    setData(result.data);
                    setRawApiData(result.rawData || null); // Store the raw API data
                    setError(null);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch monthly chart data';

                if (currentRequestRef.current === requestId && isMountedRef.current) {
                    setError(errorMessage);
                    setData(null);
                    setRawApiData(null);
                }
            } finally {
                if (currentRequestRef.current === requestId && isMountedRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [getApiDateStrings, enableRetry, maxRetries],
    );

    /**
     * Debounced data fetching
     */
    const debouncedFetch = useCallback(
        (dateRange: DateRange) => {
            // Clear existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Generate unique request ID
            const requestId = `monthly-chart-${Date.now()}-${Math.random()}`;
            currentRequestRef.current = requestId;

            // Set up debounced fetch
            debounceTimerRef.current = setTimeout(() => {
                if (currentRequestRef.current === requestId && isMountedRef.current) {
                    fetchData(dateRange, requestId);
                }
            }, debounceMs);
        },
        [debounceMs],
    );

    /**
     * Manual refetch function
     */
    const refetch = useCallback(async () => {
        if (!isValidForMonthlyChart || !selectedDateRange) {
            return;
        }

        // Clear cache and fetch fresh data
        const apiDates = getApiDateStrings(selectedDateRange);
        if (apiDates) {
            clearMonthlyChartCache(apiDates.startDate, apiDates.endDate);
        }

        const requestId = `monthly-chart-refetch-${Date.now()}-${Math.random()}`;
        currentRequestRef.current = requestId;

        await fetchData(selectedDateRange, requestId);
    }, [isValidForMonthlyChart, selectedDateRange, getApiDateStrings, fetchData]);

    /**
     * Clear cache function
     */
    const clearCache = useCallback(() => {
        if (selectedDateRange?.from && selectedDateRange?.to) {
            const startDate = formatDateForApi(selectedDateRange.from);
            const endDate = formatDateForApi(selectedDateRange.to);
            clearMonthlyChartCache(startDate, endDate);
        } else {
            clearMonthlyChartCache(); // Clear all cache
        }
    }, [selectedDateRange]);

    /**
     * Effect to fetch data when date range changes
     */
    useEffect(() => {
        // Generate unique effect ID to track this effect execution
        const effectId = `effect-${Date.now()}-${Math.random()}`;

        if (process.env.NODE_ENV === 'development') {
            console.log(
                `🔄 useMonthlyChart useEffect triggered - effectId: ${effectId}, isValidForMonthlyChart: ${isValidForMonthlyChart}, selectedDateRange:`,
                selectedDateRange,
            );
        }

        // If there's already an active effect, cancel it
        if (activeEffectRef.current && activeEffectRef.current !== effectId) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`⛔ Cancelling previous effect: ${activeEffectRef.current} in favor of ${effectId}`);
            }
            // Clear any pending debounce timers from previous effect
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        }

        // Mark this effect as active
        activeEffectRef.current = effectId;

        if (!isValidForMonthlyChart || !selectedDateRange) {
            // Reset state when invalid date range
            setData(null);
            setRawApiData(null);
            setError(null);
            setIsLoading(false);
            currentRequestRef.current = null;
            activeEffectRef.current = null;
            return;
        }

        // Fetch data with debouncing
        if (selectedDateRange) {
            // Clear existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Generate unique request ID
            const requestId = `monthly-chart-${Date.now()}-${Math.random()}`;
            currentRequestRef.current = requestId;

            // Set up debounced fetch
            debounceTimerRef.current = setTimeout(() => {
                if (currentRequestRef.current === requestId && isMountedRef.current) {
                    fetchData(selectedDateRange, requestId);
                }
            }, debounceMs);
        }

        // Cleanup function
        return () => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`🧹 Cleaning up effect: ${effectId}`);
            }

            // Only clear if this is still the active effect
            if (activeEffectRef.current === effectId) {
                activeEffectRef.current = null;

                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                    debounceTimerRef.current = null;
                }
            }
        };
    }, [isValidForMonthlyChart, selectedDateRange, debounceMs]);

    /**
     * Cleanup effect on unmount
     */
    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;

            // Clear debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        data,
        rawApiData,
        isLoading,
        error,
        refetch,
        clearCache,
        isValidForMonthlyChart,
    };
};
