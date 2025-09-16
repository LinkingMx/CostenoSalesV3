/**
 * Daily Branches Context
 * Shared context for daily branches data to avoid duplicate API calls
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useDailyBranches } from '@/hooks/use-daily-branches';
import { useApiLoadingContext } from '@/contexts/api-loading-context';
import type { BranchSalesData } from '@/components/daily-sales-branches/types';
import type { DateRange } from '@/components/main-filter-calendar';

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
  skipLoading?: boolean;
}

/**
 * Provider component that makes a single API call and shares the daily branches data
 * Integrated with global API loading tracking system
 */
export const DailyBranchesProvider: React.FC<DailyBranchesProviderProps> = React.memo(({
  children,
  selectedDateRange,
  skipLoading = false
}) => {
  const { registerApiCall, completeApiCall } = useApiLoadingContext();

  const onApiStart = React.useCallback(() => {
    if (!skipLoading) {
      registerApiCall('daily-branches-shared-api', 'DailyBranchesProvider', {
        endpoint: 'main_dashboard_data',
        priority: 'medium',
        description: 'Daily branches data with week-over-week comparison'
      });
    }
  }, [registerApiCall, skipLoading]);

  const onApiComplete = React.useCallback((success: boolean) => {
    if (!skipLoading) {
      completeApiCall('daily-branches-shared-api', success);
    }
  }, [completeApiCall, skipLoading]);

  const onError = React.useCallback(() => {
    // Silently handle errors
  }, []);

  const dailyBranchesData = useDailyBranches(selectedDateRange, {
    enableRetry: true,
    maxRetries: 3,
    debounceMs: 300,
    onApiStart,
    onApiComplete,
    onError
  });

  return (
    <DailyBranchesContext.Provider value={dailyBranchesData}>
      {children}
    </DailyBranchesContext.Provider>
  );
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