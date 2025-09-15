/**
 * Weekly Chart Context
 * Shared context for weekly chart data to avoid duplicate API calls
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useWeeklyChart } from '@/hooks/use-weekly-chart';
import { useApiLoadingContext } from '@/contexts/api-loading-context';
import type { WeeklyChartData } from '@/components/weekly-chart-comparison/types';
import type { DateRange } from '@/components/main-filter-calendar';

interface WeeklyChartContextValue {
  data: WeeklyChartData | null;
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
 * Integrated with global API loading tracking system
 */
export const WeeklyChartProvider: React.FC<WeeklyChartProviderProps> = React.memo(({
  children,
  selectedDateRange
}) => {
  const { registerApiCall, completeApiCall } = useApiLoadingContext();

  const onApiStart = React.useCallback(() => {
    registerApiCall('weekly-chart-shared-api', 'WeeklyChartProvider', {
      endpoint: 'main_dashboard_data',
      priority: 'medium',
      description: 'Weekly chart comparison data for 3-week analysis'
    });
  }, [registerApiCall]);

  const onApiComplete = React.useCallback((success: boolean) => {
    completeApiCall('weekly-chart-shared-api', success);
  }, [completeApiCall]);

  const onError = React.useCallback(() => {
    // Silently handle errors
  }, []);

  const weeklyChartData = useWeeklyChart(selectedDateRange, {
    enableRetry: true,
    maxRetries: 3,
    debounceMs: 300,
    minLoadingDuration: 2000,
    onApiStart,
    onApiComplete,
    onError
  });

  return (
    <WeeklyChartContext.Provider value={weeklyChartData}>
      {children}
    </WeeklyChartContext.Provider>
  );
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