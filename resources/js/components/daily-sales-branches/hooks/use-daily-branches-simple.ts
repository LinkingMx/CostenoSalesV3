import * as React from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchSalesData } from '../types';
import { isSingleDaySelected, isSelectedDateToday } from '../utils';
import { fetchMainDashboardData, formatDateForApi } from '@/lib/services/main-dashboard.service';

/**
 * Simple hook for daily branches following the same pattern as weekly/monthly
 * Gets data directly from main_dashboard_data endpoint
 */

interface UseDailyBranchesSimpleReturn {
  branchesData: BranchSalesData[];
  isLoading: boolean;
  error: string | null;
  isValidSingleDay: boolean;
  isToday: boolean;
  refetch: () => void;
}

export const useDailyBranchesSimple = (selectedDateRange?: DateRange): UseDailyBranchesSimpleReturn => {
  const [branchesData, setBranchesData] = React.useState<BranchSalesData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Validate that exactly one day is selected
  const isValidSingleDay = React.useMemo(() => {
    return isSingleDaySelected(selectedDateRange);
  }, [selectedDateRange]);

  // Check if selected date is today
  const isToday = React.useMemo(() => {
    return isSelectedDateToday(selectedDateRange);
  }, [selectedDateRange]);

  // Format date for API
  const formattedDate = React.useMemo(() => {
    if (!isValidSingleDay || !selectedDateRange?.from) {
      return null;
    }
    return formatDateForApi(selectedDateRange.from);
  }, [isValidSingleDay, selectedDateRange]);

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    if (!formattedDate) {
      setBranchesData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎯 DailyBranchesSimple: Fetching data for date:', formattedDate);

      const result = await fetchMainDashboardData(
        formattedDate,
        formattedDate, // Same date for single day
        true // Include previous week for percentage calculation
      );

      if (result.error) {
        setError(result.error);
        setBranchesData([]);
      } else {
        console.log('✅ DailyBranchesSimple: Data received:', {
          branchCount: result.branches?.length || 0,
          totalSales: result.totalSales
        });
        setBranchesData(result.branches || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos diarios';
      console.error('❌ DailyBranchesSimple: Fetch error:', errorMessage);
      setError(errorMessage);
      setBranchesData([]);
    } finally {
      setIsLoading(false);
    }
  }, [formattedDate]);

  // Refetch function
  const refetch = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Auto-fetch when dependencies change
  React.useEffect(() => {
    if (isValidSingleDay && formattedDate) {
      fetchData();
    } else {
      setBranchesData([]);
      setError(null);
    }
  }, [isValidSingleDay, formattedDate, fetchData]);

  return {
    branchesData,
    isLoading,
    error,
    isValidSingleDay,
    isToday,
    refetch
  };
};