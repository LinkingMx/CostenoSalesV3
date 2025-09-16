import type { DateRange } from '@/components/main-filter-calendar';
import { useMonthlyChartContext } from '@/contexts/monthly-chart-context';
import * as React from 'react';
import type { MonthlySummaryData } from '../types';
import { isValidApiData, transformApiDataToMonthlySummary } from '../utils';
import { isCompleteMonthSelected } from '@/lib/date-validation';

/**
 * Custom hook for managing monthly sales comparison data from API.
 * Handles fetching, transformation, and state management for monthly summary data.
 *
 * @param {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @returns {UseMonthlySalesComparisonReturn} Hook state and methods
 *
 * @description This hook:
 * - Validates that exactly one complete month (first day to last day) is selected
 * - Fetches raw API data using the existing monthly chart service
 * - Transforms API range data to monthly summary format using transformApiDataToMonthlySummary
 * - Manages loading, error, and data states with proper type safety
 * - Provides chronological monthly data (two months ago → previous → current)
 *
 * @example
 * ```tsx
 * const { monthlySummaryData, isLoading, error, isValidCompleteMonth } = useMonthlySalesComparison(selectedDateRange);
 *
 * if (!isValidCompleteMonth) return null;
 * if (isLoading) return <MonthlySalesComparisonSkeleton />;
 * if (error) return null;
 *
 * return (
 *   <div>
 *     {monthlySummaryData.map(month => <MonthlySummaryCard key={month.monthLabel} data={month} />)}
 *   </div>
 * );
 * ```
 */

export interface UseMonthlySalesComparisonReturn {
    monthlySummaryData: MonthlySummaryData[];
    isLoading: boolean;
    error: string | null;
    isValidCompleteMonth: boolean;
    refetch: () => void;
}

export const useMonthlySalesComparison = (selectedDateRange?: DateRange): UseMonthlySalesComparisonReturn => {
    // Get shared data from context - single API call for all monthly components
    const { rawApiData, isLoading, error, refetch, isValidForMonthlyChart } = useMonthlyChartContext();

    // Validate that exactly one complete month is selected (first day to last day)
    const isValidCompleteMonth = React.useMemo(() => {
        return isCompleteMonthSelected(selectedDateRange) && isValidForMonthlyChart;
    }, [selectedDateRange, isValidForMonthlyChart]);

    // Transform raw API data to monthly summary format with proper validation
    const monthlySummaryData = React.useMemo((): MonthlySummaryData[] => {
        if (!rawApiData || !isValidApiData(rawApiData)) {
            return [];
        }
        return transformApiDataToMonthlySummary(rawApiData, selectedDateRange);
    }, [rawApiData, selectedDateRange]);

    return {
        monthlySummaryData,
        isLoading,
        error,
        isValidCompleteMonth,
        refetch,
    };
};