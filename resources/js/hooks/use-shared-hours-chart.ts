/**
 * Shared Hours Chart Hook
 * Single API call shared between daily-chart-comparison and daily-sales-comparison
 */

import type { DateRange } from '@/components/main-filter-calendar';
import { formatDateForApi } from '@/lib/services/hours-chart.service';
import type { ProcessedChartData } from '@/lib/services/types';
import { isSingleDaySelected } from '@/lib/utils/date-validation';
import { useMemo } from 'react';
import { useHoursChart, type UseHoursChartOptions } from './use-hours-chart';

export interface UseSharedHoursChartOptions extends UseHoursChartOptions {
    onApiCallStatusChange?: (isLoading: boolean) => void;
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
    options: UseSharedHoursChartOptions = {},
): UseSharedHoursChartReturn => {
    const { onApiCallStatusChange, ...hoursChartOptions } = options;

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

    // Enhanced options with API tracking callbacks
    const enhancedOptions = useMemo(
        () => ({
            ...hoursChartOptions,

            onSuccess: (data: ProcessedChartData) => {
                onApiCallStatusChange?.(true);
                hoursChartOptions.onSuccess?.(data);
            },
            onError: (error: string) => {
                onApiCallStatusChange?.(false);
                hoursChartOptions.onError?.(error);
            },
        }),
        [hoursChartOptions, onApiCallStatusChange],
    );

    // Use the existing useHoursChart hook
    const { data, isLoading, error, refetch, clearCache } = useHoursChart(apiDateString, enhancedOptions);

    return {
        data,
        isLoading,
        error,
        refetch,
        clearCache,
        isValidForDailyComponents,
    };
};
