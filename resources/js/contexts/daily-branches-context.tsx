/**
 * Daily Branches Context
 * Shared context for daily branches data to avoid duplicate API calls
 */

import type { BranchSalesData } from '@/components/daily-sales-branches/types';
import type { DateRange } from '@/components/main-filter-calendar';
import { useDailyBranches } from '@/hooks/use-daily-branches';
import React, { createContext, ReactNode, useContext } from 'react';

interface DailyBranchesContextValue {
    branches: BranchSalesData[];
    totalSales: number;
    rawApiData: unknown | null; // Raw API response for components that need cards data
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
    isValidForDailyBranches: boolean;
    isToday: boolean;
}

const DailyBranchesContext = createContext<DailyBranchesContextValue | null>(null);

interface DailyBranchesProviderProps {
    children: ReactNode;
    selectedDateRange: DateRange | undefined;
}

/**
 * Provider component that makes a single API call and shares the daily branches data
 */
export const DailyBranchesProvider: React.FC<DailyBranchesProviderProps> = React.memo(({ children, selectedDateRange }) => {
    const dailyBranchesData = useDailyBranches(selectedDateRange, {
        enableRetry: true,
        maxRetries: 3,
        debounceMs: 300,
    });

    return <DailyBranchesContext.Provider value={dailyBranchesData}>{children}</DailyBranchesContext.Provider>;
});

/**
 * Hook to consume the shared daily branches data
 */
export const useDailyBranchesContext = (): DailyBranchesContextValue => {
    const context = useContext(DailyBranchesContext);

    if (!context) {
        throw new Error('useDailyBranchesContext must be used within a DailyBranchesProvider');
    }

    return context;
};
