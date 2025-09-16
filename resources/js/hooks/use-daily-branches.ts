/**
 * Hook for managing daily branches data with week-over-week comparison
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchSalesData } from '@/components/daily-sales-branches/types';
import { fetchMainDashboardData, formatDateForApi, isValidDateRange } from '@/lib/services/main-dashboard.service';
import { isSingleDaySelected, isSelectedDateToday } from '@/components/daily-sales-branches/utils';

interface UseDailyBranchesOptions {
  /** Whether to enable automatic data fetching */
  enableRetry?: boolean;
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Callback when API call starts */
  onApiStart?: () => void;
  /** Callback when API call completes */
  onApiComplete?: (success: boolean) => void;
  /** Callback when API call errors */
  onError?: (error: string) => void;
}

interface UseDailyBranchesReturn {
  branches: BranchSalesData[];
  totalSales: number;
  rawApiData: unknown | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isValidForDailyBranches: boolean;
  isToday: boolean;
}

/**
 * Hook for managing daily branches data with API integration
 */
export function useDailyBranches(
  selectedDateRange?: DateRange,
  options: UseDailyBranchesOptions = {}
): UseDailyBranchesReturn {
  const {
    enableRetry = true,
    maxRetries = 3,
    debounceMs = 300,
    onApiStart,
    onApiComplete,
    onError
  } = options;

  // State management
  const [branches, setBranches] = useState<BranchSalesData[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [rawApiData, setRawApiData] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track active request to prevent race conditions and enable cancellation
  const activeRequestRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize visibility check to prevent unnecessary recalculations
  const isValidForDailyBranches = useMemo(() => {
    return isSingleDaySelected(selectedDateRange);
  }, [selectedDateRange]);

  // Memoize today check to prevent unnecessary recalculations
  const isToday = useMemo(() => {
    return isSelectedDateToday(selectedDateRange);
  }, [selectedDateRange]);

  // Memoize date formatting to prevent unnecessary recalculations
  const formattedDates = useMemo(() => {
    if (!isValidForDailyBranches || !selectedDateRange?.from) {
      return null;
    }

    const date = formatDateForApi(selectedDateRange.from);
    return {
      startDate: date,
      endDate: date // Same date for single day selection
    };
  }, [isValidForDailyBranches, selectedDateRange]);

  // Clear cache function
  const clearCache = useCallback(() => {
    // Implementation for cache clearing if needed
    console.log('🗑️ Daily branches cache cleared');
  }, []);

  // API fetch function
  const fetchData = useCallback(async (isRefresh = false) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 DAILY BRANCHES HOOK - fetchData called:', {
        isValidForDailyBranches,
        formattedDates,
        isRefresh
      });
    }

    if (!isValidForDailyBranches || !formattedDates) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚫 DAILY BRANCHES HOOK - Early return due to conditions');
      }
      return;
    }

    // Cancel any existing request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    // Validate date range
    if (!isValidDateRange(formattedDates.startDate, formattedDates.endDate)) {
      if (isMountedRef.current) {
        setError('Rango de fechas inválido');
        onError?.('Rango de fechas inválido');
      }
      return;
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    // Set loading state
    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
      onApiStart?.();
    }

    try {
      // For single day selections, include previous week comparison for percentage calculation
      const result = await fetchMainDashboardData(
        formattedDates.startDate,
        formattedDates.endDate,
        true // Include previous week data for percentage calculation
      );

      // Check if request was aborted or component unmounted
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      if (result.error) {
        setError(result.error);
        onError?.(result.error);
        onApiComplete?.(false);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Daily branches API Response received:', {
            hasError: !!result.error,
            branchesLength: result.branches?.length || 'N/A',
            totalSales: result.totalSales,
            firstBranchSample: result.branches?.[0] || 'N/A'
          });
        }

        // Validate that branches is actually an array with data
        if (!result.branches || !Array.isArray(result.branches)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API returned invalid branches data structure:', result.branches);
          }
          setBranches([]);
          setError('Estructura de datos inválida');
          onError?.('Estructura de datos inválida');
          onApiComplete?.(false);
        } else {
          setBranches(result.branches);
          setTotalSales(result.totalSales);
          setRawApiData(result); // Store raw response for potential use by other components
          setError(null);
          onApiComplete?.(true);

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Daily branches data loaded successfully:', {
              branchCount: result.branches.length,
              totalSales: result.totalSales
            });
          }
        }
      }
    } catch (err) {
      // Check if request was aborted or component unmounted
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos de sucursales diarias';
      setError(errorMessage);
      onError?.(errorMessage);
      onApiComplete?.(false);

      console.error('Daily branches data fetch error:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      // Clear the active request reference
      if (activeRequestRef.current === abortController) {
        activeRequestRef.current = null;
      }
    }
  }, [isValidForDailyBranches, formattedDates, onApiStart, onApiComplete, onError]);

  // Debounced refetch function
  const refetch = useCallback(async () => {
    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the fetch call
    debounceTimeoutRef.current = setTimeout(() => {
      fetchData(true);
    }, debounceMs);
  }, [fetchData, debounceMs]);

  // Auto-fetch on dependencies change
  useEffect(() => {
    if (isValidForDailyBranches && formattedDates) {
      // Clear any existing debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the fetch call
      debounceTimeoutRef.current = setTimeout(() => {
        fetchData(false);
      }, debounceMs);
    } else {
      // Clear data when date range becomes invalid
      setBranches([]);
      setTotalSales(0);
      setRawApiData(null);
      setError(null);
    }

    // Cleanup function to abort ongoing requests
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
    };
  }, [isValidForDailyBranches, formattedDates, fetchData, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    branches,
    totalSales,
    rawApiData,
    isLoading,
    error,
    refetch,
    clearCache,
    isValidForDailyBranches,
    isToday
  };
}