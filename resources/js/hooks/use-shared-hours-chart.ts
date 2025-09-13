/**
 * Shared Hours Chart Hook
 * Single API call shared between daily-chart-comparison and daily-sales-comparison
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDateForApi } from '@/lib/services/hours-chart.service';
import { useHoursChart, type UseHoursChartOptions } from './use-hours-chart';
import type { ProcessedChartData } from '@/lib/services/types';
import { isSingleDaySelected } from '@/lib/utils/date-validation';
import type { DateRange } from '@/components/main-filter-calendar';

export interface UseSharedHoursChartOptions extends UseHoursChartOptions {
  // Additional options can be added here if needed
}

export interface UseSharedHoursChartReturn {
  data: ProcessedChartData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isValidForDailyComponents: boolean;
}

/**
 * Shared hook that makes a single API call for both daily components
 */
export const useSharedHoursChart = (
  selectedDateRange: DateRange | undefined,
  options: UseSharedHoursChartOptions = {}
): UseSharedHoursChartReturn => {
  // Check if the date range is valid for daily components
  const isValidForDailyComponents = useMemo(() => {
    return isSingleDaySelected(selectedDateRange);
  }, [selectedDateRange]);

  // Format date for API only if valid
  const apiDateString = useMemo(() => {
    if (!isValidForDailyComponents || !selectedDateRange?.from) {
      return null;
    }
    return formatDateForApi(selectedDateRange.from);
  }, [isValidForDailyComponents, selectedDateRange?.from]);

  // Use the existing useHoursChart hook
  const {
    data,
    isLoading,
    error,
    refetch,
    clearCache
  } = useHoursChart(apiDateString, options);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache,
    isValidForDailyComponents
  };
};