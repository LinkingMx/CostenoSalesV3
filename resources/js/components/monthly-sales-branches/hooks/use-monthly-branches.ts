import * as React from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchSalesData, ApiCardData } from '../types';
import { isExactMonthSelected, transformApiCardsToBranchData, isCurrentMonth } from '../utils';
import { useMonthlyChartContext } from '@/contexts/monthly-chart-context';

/**
 * Custom hook for managing monthly branches data from API.
 * Handles fetching, transformation, and state management for monthly branch sales data.
 *
 * @param {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @returns {UseMonthlyBranchesReturn} Hook state and methods
 *
 * @description This hook:
 * - Validates that exactly one month (first to last day) is selected
 * - Fetches raw API data using the existing monthly chart service
 * - Transforms API cards data to branch format using transformApiCardsToBranchData
 * - Manages loading, error, and data states
 * - Sorts branches by total sales in descending order
 * - For monthly: openAccounts is always 0, totalSales = closedSales
 *
 * @example
 * ```tsx
 * const { branchesData, isLoading, error, isValidCompleteMonth } = useMonthlyBranches(selectedDateRange);
 *
 * if (!isValidCompleteMonth) return null;
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorState error={error} />;
 *
 * return (
 *   <div>
 *     {branchesData.map(branch => <BranchCard key={branch.id} branch={branch} />)}
 *   </div>
 * );
 * ```
 */

export interface UseMonthlyBranchesReturn {
  branchesData: BranchSalesData[];
  isLoading: boolean;
  error: string | null;
  isValidCompleteMonth: boolean;
  isCurrentMonth: boolean;
  refetch: () => void;
}

export const useMonthlyBranches = (selectedDateRange?: DateRange): UseMonthlyBranchesReturn => {
  // Get shared data from context - single API call for all monthly components
  const { rawApiData, isLoading, error, refetch, isValidForMonthlyChart } = useMonthlyChartContext();

  // Validate that exactly one complete month is selected (first to last day)
  const isValidCompleteMonth = React.useMemo(() => {
    return isExactMonthSelected(selectedDateRange) && isValidForMonthlyChart;
  }, [selectedDateRange, isValidForMonthlyChart]);

  // Check if the selected month contains today's date
  const isCurrentMonthSelected = React.useMemo(() => {
    return isCurrentMonth(selectedDateRange);
  }, [selectedDateRange]);

  // Transform raw API data to branch format
  const branchesData = React.useMemo(() => {
    // Type guard to check if rawApiData has the expected structure
    const apiData = rawApiData as { data?: { cards?: unknown } } | null;

    if (!apiData?.data?.cards) {
      return [];
    }

    const transformedData = transformApiCardsToBranchData(apiData.data.cards as Record<string, ApiCardData>);

    return transformedData;
  }, [rawApiData]);

  return {
    branchesData,
    isLoading,
    error,
    isValidCompleteMonth,
    isCurrentMonth: isCurrentMonthSelected,
    refetch
  };
};
