/**
 * useHoursChart Hook
 * Custom React hook for fetching and managing hours chart data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchHoursChartData,
  fetchWithRetry,
  formatDateForApi,
  isValidDateFormat,
  clearHoursChartCache,
} from '@/lib/services/hours-chart.service';
import { ProcessedChartData } from '@/lib/services/types';

export interface UseHoursChartOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  debounceMs?: number;
  onError?: (error: string) => void;
  onSuccess?: (data: ProcessedChartData) => void;
}

export interface UseHoursChartReturn {
  data: ProcessedChartData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for fetching hours chart data with caching and error handling
 */
export const useHoursChart = (
  date: Date | string | null,
  options: UseHoursChartOptions = {}
): UseHoursChartReturn => {
  const {
    enableRetry = true,
    maxRetries = 3,
    debounceMs = 300,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<ProcessedChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and debouncing
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchedDateRef = useRef<string | null>(null);

  /**
   * Convert date to API format
   */
  const getFormattedDate = useCallback((inputDate: Date | string | null): string | null => {
    if (!inputDate) return null;

    if (typeof inputDate === 'string') {
      if (isValidDateFormat(inputDate)) {
        return inputDate;
      }
      // Try to parse the string as a date
      const parsed = new Date(inputDate);
      if (!isNaN(parsed.getTime())) {
        return formatDateForApi(parsed);
      }
      return null;
    }

    if (inputDate instanceof Date) {
      return formatDateForApi(inputDate);
    }

    return null;
  }, []);

  /**
   * Fetch data with error handling
   */
  const fetchData = useCallback(async (dateString: string) => {
    // Avoid duplicate fetches - use ref to avoid dependency on data
    if (lastFetchedDateRef.current === dateString) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const result = enableRetry
        ? await fetchWithRetry(dateString, maxRetries)
        : await fetchHoursChartData(dateString);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.hasError) {
        const errorMessage = 'Error al cargar los datos del gráfico';
        setError(errorMessage);
        setData(null);
        onError?.(errorMessage);
      } else {
        setData(result);
        setError(null);
        lastFetchedDateRef.current = dateString;
        onSuccess?.(result);
      }
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setData(null);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [enableRetry, maxRetries, onError, onSuccess]);

  /**
   * Debounced fetch function
   */
  const debouncedFetch = useCallback((dateString: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchData(dateString);
    }, debounceMs);
  }, [fetchData, debounceMs]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    const formattedDate = getFormattedDate(date);
    if (formattedDate) {
      // Clear cache for this date before refetching
      clearHoursChartCache(formattedDate);
      lastFetchedDateRef.current = null; // Force refetch
      await fetchData(formattedDate);
    }
  }, [date, fetchData, getFormattedDate]);

  /**
   * Clear cache function
   */
  const clearCache = useCallback(() => {
    const formattedDate = getFormattedDate(date);
    if (formattedDate) {
      clearHoursChartCache(formattedDate);
      lastFetchedDateRef.current = null;
    } else {
      clearHoursChartCache();
      lastFetchedDateRef.current = null;
    }
  }, [date, getFormattedDate]);

  /**
   * Effect to fetch data when date changes
   */
  useEffect(() => {
    const formattedDate = getFormattedDate(date);

    if (!formattedDate) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    debouncedFetch(formattedDate);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [date, debouncedFetch, getFormattedDate]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache,
  };
};

/**
 * Hook for managing loading state with minimum duration
 */
export const useMinimumLoadingDuration = (
  isLoading: boolean,
  minimumMs: number = 500
): boolean => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading && !loadingStartRef.current) {
      loadingStartRef.current = Date.now();
      setShowLoading(true);
    } else if (!isLoading && loadingStartRef.current) {
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = Math.max(0, minimumMs - elapsed);

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShowLoading(false);
          loadingStartRef.current = null;
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
        loadingStartRef.current = null;
      }
    }
  }, [isLoading, minimumMs]);

  return showLoading;
};