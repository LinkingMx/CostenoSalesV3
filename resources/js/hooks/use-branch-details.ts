/**
 * Hook for managing branch details data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import { fetchStoreDetailsWithCache, type StoreData } from '@/lib/services/branch-details.service';

export interface UseBranchDetailsOptions {
  storeId: number | null;
  dateRange: DateRange | undefined;
  autoFetch?: boolean;
  onSuccess?: (data: StoreData) => void;
  onError?: (error: Error) => void;
}

export interface UseBranchDetailsReturn {
  data: StoreData | null;
  isLoading: boolean;
  error: string | null;
  isValidDateRange: boolean;
  fetchData: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Validate if date range is complete and valid
 */
function isValidDateRange(dateRange: DateRange | undefined): boolean {
  if (!dateRange || !dateRange.from || !dateRange.to) {
    return false;
  }

  const from = dateRange.from;
  const to = dateRange.to;

  // Check if dates are valid Date objects
  if (!(from instanceof Date) || !(to instanceof Date)) {
    return false;
  }

  // Check if dates are not NaN
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return false;
  }

  // Check if from date is not after to date
  if (from > to) {
    return false;
  }

  // Check if date range is not too far in the future
  const today = new Date();
  const maxFutureDate = new Date();
  maxFutureDate.setDate(today.getDate() + 1); // Allow up to 1 day in the future

  if (from > maxFutureDate) {
    return false;
  }

  return true;
}

/**
 * Custom hook for managing branch details data with automatic fetching
 */
export function useBranchDetails({
  storeId,
  dateRange,
  autoFetch = true,
  onSuccess,
  onError
}: UseBranchDetailsOptions): UseBranchDetailsReturn {
  const [data, setData] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track current request to avoid race conditions
  const currentRequestRef = useRef<AbortController | null>(null);

  // Validate date range
  const isValidRange = isValidDateRange(dateRange);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (storeId === null) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🚫 useBranchDetails: Invalid storeId (null), skipping fetch');
      }
      return;
    }

    if (!isValidRange) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🚫 useBranchDetails: Invalid date range, skipping fetch');
      }
      return;
    }

    // Cancel any ongoing request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 useBranchDetails: Fetching data for store', storeId, 'with date range:', {
          from: dateRange?.from?.toISOString(),
          to: dateRange?.to?.toISOString()
        });
      }

      const result = await fetchStoreDetailsWithCache(storeId, dateRange!, {
        signal: abortController.signal,
        retries: 3
      });

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      setData(result);
      onSuccess?.(result);

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ useBranchDetails: Data fetched successfully');
      }

    } catch (err) {
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener datos de la sucursal';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ useBranchDetails: Fetch failed:', errorMessage);
      }
    } finally {
      // Only set loading to false if this is still the current request
      if (currentRequestRef.current === abortController) {
        setIsLoading(false);
        currentRequestRef.current = null;
      }
    }
  }, [storeId, dateRange, isValidRange, onSuccess, onError]);

  // Refetch function (force refresh)
  const refetch = useCallback(async () => {
    if (storeId === null || !isValidRange) return;

    // Cancel any ongoing request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchStoreDetailsWithCache(storeId, dateRange!, {
        signal: abortController.signal,
        retries: 3,
        forceRefresh: true // Force refresh bypasses cache
      });

      if (abortController.signal.aborted) {
        return;
      }

      setData(result);
      onSuccess?.(result);

    } catch (err) {
      if (abortController.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al refrescar datos';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      if (currentRequestRef.current === abortController) {
        setIsLoading(false);
        currentRequestRef.current = null;
      }
    }
  }, [storeId, dateRange, isValidRange, onSuccess, onError]);

  // Auto-fetch on dependencies change
  useEffect(() => {
    if (autoFetch && storeId !== null && isValidRange) {
      // Call fetchData without adding it as a dependency to avoid infinite loops
      const abortController = new AbortController();
      currentRequestRef.current = abortController;

      const doFetch = async () => {
        setIsLoading(true);
        setError(null);

        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 useBranchDetails: Auto-fetching data for store', storeId, 'with date range:', {
              from: dateRange?.from?.toISOString(),
              to: dateRange?.to?.toISOString()
            });
          }

          const result = await fetchStoreDetailsWithCache(storeId, dateRange!, {
            signal: abortController.signal,
            retries: 3
          });

          if (abortController.signal.aborted) {
            return;
          }

          setData(result);
          onSuccess?.(result);

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ useBranchDetails: Data auto-fetched successfully');
          }
        } catch (err) {
          if (abortController.signal.aborted) {
            return;
          }

          const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener datos de la sucursal';
          setError(errorMessage);
          onError?.(err instanceof Error ? err : new Error(errorMessage));

          if (process.env.NODE_ENV === 'development') {
            console.error('❌ useBranchDetails: Auto-fetch failed:', errorMessage);
          }
        } finally {
          if (currentRequestRef.current === abortController) {
            setIsLoading(false);
            currentRequestRef.current = null;
          }
        }
      };

      doFetch();
    }

    // Cleanup function to abort ongoing requests
    return () => {
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
        currentRequestRef.current = null;
      }
    };
  }, [autoFetch, storeId, isValidRange, dateRange]);

  // Reset data when storeId is invalid or date range becomes invalid
  useEffect(() => {
    if (storeId === null || !isValidRange) {
      setData(null);
      setError(null);
    }
  }, [storeId, isValidRange]);

  return {
    data,
    isLoading,
    error,
    isValidDateRange: isValidRange,
    fetchData,
    refetch,
    clearError
  };
}