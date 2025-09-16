/**
 * Weekly Chart Hook
 * Custom hook for managing weekly chart data with API integration, caching, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { WeeklyChartData } from '@/components/weekly-chart-comparison/types';
import {
  fetchWeeklyChartWithRetry,
  formatDateForApi,
  isValidWeeklyChartDateRange,
  clearWeeklyChartCache
} from '@/lib/services/weekly-chart.service';
import { isCompleteWeekSelected } from '@/components/weekly-chart-comparison/utils';

interface UseWeeklyChartOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  debounceMs?: number;
  minLoadingDuration?: number;
  onApiStart?: () => void;
  onApiComplete?: (success: boolean) => void;
  onError?: (errorMessage: string) => void;
}

interface UseWeeklyChartReturn {
  data: WeeklyChartData | null;
  rawApiData: unknown | null; // Raw API response data
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isValidForWeeklyChart: boolean;
}

/**
 * Custom hook for weekly chart data management
 * Provides API integration, caching, loading states, and error handling
 */
export const useWeeklyChart = (
  selectedDateRange: DateRange | undefined,
  options: UseWeeklyChartOptions = {}
): UseWeeklyChartReturn => {
  const {
    enableRetry = true,
    maxRetries = 3,
    debounceMs = 300,
    minLoadingDuration = 2000, // 2 seconds minimum loading
    onApiStart,
    onApiComplete,
    onError,
  } = options;

  const [data, setData] = useState<WeeklyChartData | null>(null);
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

  // Check if the selected date range is valid for weekly chart
  const isValidForWeeklyChart = isCompleteWeekSelected(selectedDateRange);

  /**
   * Convert DateRange to API format strings
   */
  const getApiDateStrings = useCallback((dateRange: DateRange): { startDate: string; endDate: string } | null => {
    if (!dateRange?.from || !dateRange?.to) {
      return null;
    }

    const startDate = formatDateForApi(dateRange.from);
    const endDate = formatDateForApi(dateRange.to);

    if (!isValidWeeklyChartDateRange(startDate, endDate)) {
      return null;
    }

    return { startDate, endDate };
  }, []);

  /**
   * Fetch data from API with loading management
   */
  const fetchData = useCallback(async (dateRange: DateRange, requestId: string) => {
    const apiDates = getApiDateStrings(dateRange);
    if (!apiDates) {
      if (isMountedRef.current) {
        setError('Invalid date range for weekly chart');
        setIsLoading(false);
      }
      return;
    }

    const { startDate, endDate } = apiDates;

    // Debug logging to track API calls
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 useWeeklyChart: Starting fetchData for ${startDate} to ${endDate} (Request ID: ${requestId})`);
      console.trace('Call stack trace');
    }

    try {
      // Start loading and track the minimum duration
      const loadingStartTime = Date.now();
      setIsLoading(true);
      setError(null);

      // Notify API start
      onApiStart?.();

      // Fetch data with or without retry based on options
      const result = enableRetry
        ? await fetchWeeklyChartWithRetry(startDate, endDate, maxRetries)
        : await fetchWeeklyChartWithRetry(startDate, endDate, 0); // No retries

      // Check if this request is still current (prevent race conditions)
      if (currentRequestRef.current !== requestId || !isMountedRef.current) {
        return;
      }

      // Calculate remaining loading time to meet minimum duration
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);

      // Wait for minimum loading duration if needed
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Check again if request is still current after delay
      if (currentRequestRef.current !== requestId || !isMountedRef.current) {
        return;
      }

      if (result.error) {
        setError(result.error);
        setData(null);
        setRawApiData(null);
        onError?.(result.error);
        onApiComplete?.(false);
      } else {
        setData(result.data);
        setRawApiData(result.rawData || null); // Store the raw API data
        setError(null);
        onApiComplete?.(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weekly chart data';

      if (currentRequestRef.current === requestId && isMountedRef.current) {
        setError(errorMessage);
        setData(null);
        setRawApiData(null);
        onError?.(errorMessage);
        onApiComplete?.(false);
      }
    } finally {
      if (currentRequestRef.current === requestId && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [getApiDateStrings, enableRetry, maxRetries, minLoadingDuration]);

  /**
   * Debounced data fetching
   */
  const debouncedFetch = useCallback((dateRange: DateRange) => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Generate unique request ID
    const requestId = `weekly-chart-${Date.now()}-${Math.random()}`;
    currentRequestRef.current = requestId;

    // Set up debounced fetch
    debounceTimerRef.current = setTimeout(() => {
      if (currentRequestRef.current === requestId && isMountedRef.current) {
        fetchData(dateRange, requestId);
      }
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    if (!isValidForWeeklyChart || !selectedDateRange) {
      return;
    }

    // Clear cache and fetch fresh data
    const apiDates = getApiDateStrings(selectedDateRange);
    if (apiDates) {
      clearWeeklyChartCache(apiDates.startDate, apiDates.endDate);
    }

    const requestId = `weekly-chart-refetch-${Date.now()}-${Math.random()}`;
    currentRequestRef.current = requestId;

    await fetchData(selectedDateRange, requestId);
  }, [isValidForWeeklyChart, selectedDateRange, getApiDateStrings, fetchData]);

  /**
   * Clear cache function
   */
  const clearCache = useCallback(() => {
    if (selectedDateRange?.from && selectedDateRange?.to) {
      const startDate = formatDateForApi(selectedDateRange.from);
      const endDate = formatDateForApi(selectedDateRange.to);
      clearWeeklyChartCache(startDate, endDate);
    } else {
      clearWeeklyChartCache(); // Clear all cache
    }
  }, [selectedDateRange]);

  /**
   * Effect to fetch data when date range changes
   */
  useEffect(() => {
    // Generate unique effect ID to track this effect execution
    const effectId = `effect-${Date.now()}-${Math.random()}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 useWeeklyChart useEffect triggered - effectId: ${effectId}, isValidForWeeklyChart: ${isValidForWeeklyChart}, selectedDateRange:`, selectedDateRange);
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

    if (!isValidForWeeklyChart || !selectedDateRange) {
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
      const requestId = `weekly-chart-${Date.now()}-${Math.random()}`;
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
  }, [isValidForWeeklyChart, selectedDateRange, debounceMs]);

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
    isValidForWeeklyChart,
  };
};