/**
 * Monthly Chart Context
 * Shared context for monthly chart data to avoid duplicate API calls
 */

import type { DateRange } from '@/components/main-filter-calendar';
import type { MonthlyChartData } from '@/components/monthly-chart-comparison/types';
import { useApiLoadingContext } from '@/contexts/api-loading-context';
import { useMonthlyChart } from '@/hooks/use-monthly-chart';
import React, { createContext, ReactNode, useContext } from 'react';

interface MonthlyChartContextValue {
    data: MonthlyChartData | null;
    rawApiData: unknown | null; // Raw API response for components that need cards/range data
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
    isValidForMonthlyChart: boolean;
}

const MonthlyChartContext = createContext<MonthlyChartContextValue | null>(null);

interface MonthlyChartProviderProps {
    children: ReactNode;
    selectedDateRange: DateRange | undefined;
}

/**
 * Provider component that makes a single API call and shares the monthly chart data
 * Integrated with global API loading tracking system
 */
export const MonthlyChartProvider: React.FC<MonthlyChartProviderProps> = React.memo(({ children, selectedDateRange }) => {
    const { registerApiCall, completeApiCall } = useApiLoadingContext();

    const onApiStart = React.useCallback(() => {
        registerApiCall('monthly-chart-shared-api', 'MonthlyChartProvider', {
            endpoint: 'main_dashboard_data',
            priority: 'medium',
            description: 'Monthly chart comparison data for 3-month analysis',
        });
    }, [registerApiCall]);

    const onApiComplete = React.useCallback(
        (success: boolean) => {
            completeApiCall('monthly-chart-shared-api', success);
        },
        [completeApiCall],
    );

    const onError = React.useCallback(() => {
        // Silently handle errors
    }, []);

    const monthlyChartData = useMonthlyChart(selectedDateRange, {
        enableRetry: true,
        maxRetries: 3,
        debounceMs: 300,
        minLoadingDuration: 2000,
        onApiStart,
        onApiComplete,
        onError,
    });

    return <MonthlyChartContext.Provider value={monthlyChartData}>{children}</MonthlyChartContext.Provider>;
});

/**
 * Hook to consume the shared monthly chart data
 */
export const useMonthlyChartContext = (): MonthlyChartContextValue => {
    const context = useContext(MonthlyChartContext);

    if (!context) {
        throw new Error('useMonthlyChartContext must be used within a MonthlyChartProvider');
    }

    return context;
};
