import type { DateRange } from '@/components/main-filter-calendar';
import { useWeeklyChartContext } from '@/contexts/weekly-chart-context';
import * as React from 'react';
import type { ApiCardData, BranchSalesData } from '../types';
import { isCurrentWeek, isExactWeekSelected, transformApiCardsToBranchData } from '../utils';

/**
 * Custom hook for managing weekly branches data from API.
 * Handles fetching, transformation, and state management for branch sales data.
 *
 * @param {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @returns {UseWeeklyBranchesReturn} Hook state and methods
 *
 * @description This hook:
 * - Validates that exactly one week (Monday to Sunday) is selected
 * - Fetches raw API data using the existing weekly chart service
 * - Transforms API cards data to branch format using transformApiCardsToBranchData
 * - Manages loading, error, and data states
 * - Sorts branches by total sales in descending order
 *
 * @example
 * ```tsx
 * const { branchesData, isLoading, error, isValidCompleteWeek } = useWeeklyBranches(selectedDateRange);
 *
 * if (!isValidCompleteWeek) return null;
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

export interface UseWeeklyBranchesReturn {
    branchesData: BranchSalesData[];
    isLoading: boolean;
    error: string | null;
    isValidCompleteWeek: boolean;
    isCurrentWeek: boolean;
    refetch: () => void;
}

export const useWeeklyBranches = (selectedDateRange?: DateRange): UseWeeklyBranchesReturn => {
    // Get shared data from context - single API call for all weekly components
    const { rawApiData, isLoading, error, refetch, isValidForWeeklyChart } = useWeeklyChartContext();

    // Validate that exactly one complete week is selected (Monday to Sunday)
    const isValidCompleteWeek = React.useMemo(() => {
        return isExactWeekSelected(selectedDateRange) && isValidForWeeklyChart;
    }, [selectedDateRange, isValidForWeeklyChart]);

    // Check if the selected week contains today's date
    const isCurrentWeekSelected = React.useMemo(() => {
        return isCurrentWeek(selectedDateRange);
    }, [selectedDateRange]);

    // Transform raw API data to branch format
    const branchesData = React.useMemo(() => {
        // Type guard to check if rawApiData has the expected structure
        const apiData = rawApiData as { data?: { cards?: unknown } } | null;

        if (!apiData?.data?.cards) {
            return [];
        }

        const transformedData = transformApiCardsToBranchData(apiData.data.cards as Record<string, ApiCardData>);

        if (process.env.NODE_ENV === 'development') {
            console.log(`useWeeklyBranches: Transformed ${transformedData.length} branches from shared context`);
        }

        return transformedData;
    }, [rawApiData]);

    return {
        branchesData,
        isLoading,
        error,
        isValidCompleteWeek,
        isCurrentWeek: isCurrentWeekSelected,
        refetch,
    };
};
