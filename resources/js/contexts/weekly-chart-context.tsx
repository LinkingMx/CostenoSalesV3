/**
 * Weekly Chart Context
 * Shared context for weekly chart data to avoid duplicate API calls
 */

import type { DateRange } from '@/components/main-filter-calendar';
import type { WeeklyChartData } from '@/components/weekly-chart-comparison/types';
import { useWeeklyChart } from '@/hooks/use-weekly-chart';
import React, { createContext, ReactNode, useContext } from 'react';

interface WeeklyChartContextValue {
    data: WeeklyChartData | null;
    rawApiData: unknown | null; // Raw API response for components that need cards/range data
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
    isValidForWeeklyChart: boolean;
}

const WeeklyChartContext = createContext<WeeklyChartContextValue | null>(null);

interface WeeklyChartProviderProps {
    children: ReactNode;
    selectedDateRange: DateRange | undefined;
}

/**
 * Provider component that makes a single API call and shares the weekly chart data
 */
export const WeeklyChartProvider: React.FC<WeeklyChartProviderProps> = React.memo(({ children, selectedDateRange }) => {
    const weeklyChartData = useWeeklyChart(selectedDateRange, {
        enableRetry: true,
        maxRetries: 3,
        debounceMs: 300,
    });

    return <WeeklyChartContext.Provider value={weeklyChartData}>{children}</WeeklyChartContext.Provider>;
});

/**
 * Hook to consume the shared weekly chart data
 */
export const useWeeklyChartContext = (): WeeklyChartContextValue => {
    const context = useContext(WeeklyChartContext);

    if (!context) {
        throw new Error('useWeeklyChartContext must be used within a WeeklyChartProvider');
    }

    return context;
};
