/**
 * Custom hook for managing branch sales data with week-over-week comparison
 *
 * This hook handles:
 * - API integration with current and previous week data fetching
 * - Automatic percentage calculation based on week-over-week comparison
 * - Loading states for both API calls
 * - Error handling with Spanish localization
 * - Cache management and data validation
 * - Conditional visibility based on single day selection
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchSalesData } from '../types';
import { fetchMainDashboardData, formatDateForApi, isValidDateRange } from '@/lib/services/main-dashboard.service';
import { isSingleDaySelected, isSelectedDateToday } from '../utils';
import { useTrackedApiCall } from '@/hooks/use-tracked-api-call';

interface UseBranchSalesDataOptions {
  /** Whether to enable automatic data fetching */
  enabled?: boolean;
  /** Fallback data to use when API fails or is loading */
  fallbackData?: BranchSalesData[];
  /** Whether to use fallback data during loading */
  useFallbackDuringLoad?: boolean;
}

interface UseBranchSalesDataReturn {
  /** Branch sales data array */
  branches: BranchSalesData[];
  /** Total sales amount across all branches */
  totalSales: number;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether data is from cache */
  isFromCache: boolean;
  /** Whether component should be visible (single day selected) */
  isVisible: boolean;
  /** Whether the selected date is today */
  isToday: boolean;
  /** Manual refresh function */
  refresh: () => Promise<void>;
  /** Clear any errors */
  clearError: () => void;
}

/**
 * Hook for managing daily sales branches data with API integration
 */
export function useBranchSalesData(
  selectedDateRange?: DateRange,
  options: UseBranchSalesDataOptions = {}
): UseBranchSalesDataReturn {
  const {
    enabled = true,
    fallbackData = [],
    useFallbackDuringLoad = false
  } = options;

  // API tracking integration
  const { makeTrackedCall } = useTrackedApiCall({
    componentName: 'DailySalesBranches',
    defaultMetadata: {
      endpoint: 'main_dashboard_data',
      priority: 'medium',
      description: 'Branch sales data with week-over-week comparison'
    }
  });

  // State management
  const [branches, setBranches] = useState<BranchSalesData[]>(fallbackData);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  // Track active request to prevent race conditions and enable cancellation
  const activeRequestRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoization optimization: prevent unnecessary re-renders
  const memoizedBranches = useMemo(() => branches, [branches]);
  const memoizedTotalSales = useMemo(() => totalSales, [totalSales]);

  // Memoize visibility check to prevent unnecessary recalculations
  const isVisible = useMemo(() => {
    return isSingleDaySelected(selectedDateRange);
  }, [selectedDateRange]);

  // Memoize today check to prevent unnecessary recalculations
  const isTodaySelected = useMemo(() => {
    return isSelectedDateToday(selectedDateRange);
  }, [selectedDateRange]);

  // Memoize date formatting to prevent unnecessary recalculations
  const formattedDates = useMemo(() => {
    if (!isVisible || !selectedDateRange?.from) {
      return null;
    }

    const date = formatDateForApi(selectedDateRange.from);
    return {
      startDate: date,
      endDate: date // Same date for single day selection
    };
  }, [isVisible, selectedDateRange]);

  // API fetch function - FIXED: Removed circular dependency on branches.length
  const fetchData = useCallback(async (isRefresh = false) => {
    console.log('🎯 BRANCH SALES HOOK - fetchData called:', {
      enabled,
      isVisible,
      formattedDates,
      isRefresh
    });

    if (!enabled || !isVisible || !formattedDates) {
      console.log('🚫 BRANCH SALES HOOK - Early return due to conditions');
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
      }
      return;
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    // Set loading state, but only show fallback data if configured and not refreshing
    if (isMountedRef.current) {
      setIsLoading(true);
      if (!isRefresh && useFallbackDuringLoad && fallbackData.length > 0) {
        setBranches(fallbackData);
      }
      setError(null);
    }

    try {
      // For single day selections, include previous week comparison for percentage calculation
      const isSingleDay = formattedDates.startDate === formattedDates.endDate;

      const result = await makeTrackedCall(
        () => fetchMainDashboardData(
          formattedDates.startDate,
          formattedDates.endDate,
          isSingleDay // Include previous week data only for single day comparisons
        ),
        {
          callId: `branch-sales-${formattedDates.startDate}-${isRefresh ? 'refresh' : 'auto'}`,
          metadata: {
            priority: 'medium',
            description: `Branch sales for ${formattedDates.startDate}${isSingleDay ? ' with prev week comparison' : ''}`
          }
        }
      );

      // Check if request was aborted or component unmounted
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      if (result.error) {
        setError(result.error);
        // Use fallback data on error if no existing data
        setBranches((prevBranches) => {
          if (prevBranches.length === 0 && fallbackData.length > 0) {
            return fallbackData;
          }
          return prevBranches;
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 API Response received:', {
            hasError: !!result.error,
            branchesType: typeof result.branches,
            branchesIsArray: Array.isArray(result.branches),
            branchesLength: result.branches?.length || 'N/A',
            totalSales: result.totalSales,
            includedPreviousWeek: isSingleDay,
            firstBranchSample: result.branches?.[0] || 'N/A'
          });
        }

        // Validate that branches is actually an array with data
        if (!result.branches || !Array.isArray(result.branches)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API returned invalid branches data structure:', result.branches);
          }
          setBranches(fallbackData.length > 0 ? fallbackData : []);
          setError('Estructura de datos inválida');
        } else if (result.branches.length === 0) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ API returned empty branches array for date:', formattedDates.startDate);
          }
          // Use fallback data when API returns empty array
          setBranches(fallbackData.length > 0 ? fallbackData : []);
          setError(null);
        } else {
          setBranches(result.branches);
          setTotalSales(result.totalSales);
          setError(null);

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Branch sales data loaded successfully:', {
              branchCount: result.branches.length,
              totalSales: result.totalSales,
              includedPreviousWeek: isSingleDay
            });
          }
        }

        setIsFromCache(false); // Assume fresh data for now
      }
    } catch (err) {
      // Check if request was aborted or component unmounted
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos de sucursales';
      setError(errorMessage);

      // Use fallback data on error if available
      if (fallbackData.length > 0) {
        setBranches(fallbackData);
      }

      console.error('Branch sales data fetch error:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      // Clear the active request reference
      if (activeRequestRef.current === abortController) {
        activeRequestRef.current = null;
      }
    }
  }, [enabled, isVisible, formattedDates, fallbackData, useFallbackDuringLoad]); // FIXED: Removed branches.length dependency

  // Effect for automatic data fetching when dependencies change - FIXED: Added debouncing and proper cleanup
  useEffect(() => {
    // Mark as mounted
    isMountedRef.current = true;

    if (!isVisible) {
      // Cancel any pending requests
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }

      // Clear any pending timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      // Reset state when component is not visible
      setBranches([]);
      setTotalSales(0);
      setIsLoading(false);
      setError(null);
      setIsFromCache(false);
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the fetch call by 300ms to prevent rapid successive calls
    fetchTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, 300);

    // Cleanup function
    return () => {
      // Clear timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      // Cancel active request
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, formattedDates?.startDate, formattedDates?.endDate, enabled]); // FIXED: Intentionally excluding fetchData to prevent infinite loop

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      // Mark as unmounted
      isMountedRef.current = false;
    };
  }, []);

  // Manual refresh function
  const refresh = useCallback(async () => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    await fetchData(true);
  }, [fetchData]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Return memoized values to prevent unnecessary re-renders in consuming components
  return useMemo(() => ({
    branches: memoizedBranches,
    totalSales: memoizedTotalSales,
    isLoading,
    error,
    isFromCache,
    isVisible,
    isToday: isTodaySelected,
    refresh,
    clearError,
  }), [memoizedBranches, memoizedTotalSales, isLoading, error, isFromCache, isVisible, isTodaySelected, refresh, clearError]);
}

export default useBranchSalesData;