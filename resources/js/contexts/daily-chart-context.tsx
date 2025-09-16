/**
 * Daily Chart Context
 * Shared context for daily chart data to avoid duplicate API calls
 */

import type { DateRange } from '@/components/main-filter-calendar';
import { useSharedHoursChart } from '@/hooks/use-shared-hours-chart';
import type { ProcessedChartData } from '@/lib/services/types';
import React, { createContext, ReactNode, useContext } from 'react';

interface DailyChartContextValue {
    data: ProcessedChartData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
    isValidForDailyComponents: boolean;
}

const DailyChartContext = createContext<DailyChartContextValue | null>(null);

interface DailyChartProviderProps {
    children: ReactNode;
    selectedDateRange: DateRange | undefined;
}

/**
 * Provider component that makes a single API call and shares the data
 */
export const DailyChartProvider: React.FC<DailyChartProviderProps> = ({ children, selectedDateRange }) => {
    const sharedData = useSharedHoursChart(selectedDateRange, {
        enableRetry: true,
        maxRetries: 3,
        debounceMs: 300,
    });

    return <DailyChartContext.Provider value={sharedData}>{children}</DailyChartContext.Provider>;
};

/**
 * Hook to consume the shared daily chart data
 */
export const useDailyChartContext = (): DailyChartContextValue => {
    const context = useContext(DailyChartContext);

    if (!context) {
        throw new Error('useDailyChartContext must be used within a DailyChartProvider');
    }

    return context;
};
