/**
 * Daily Chart Context
 * Shared context for daily chart data to avoid duplicate API calls
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useSharedHoursChart } from '@/hooks/use-shared-hours-chart';
import { useApiLoadingContext } from '@/contexts/api-loading-context';
import type { ProcessedChartData } from '@/lib/services/types';
import type { DateRange } from '@/components/main-filter-calendar';

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
 * Now integrated with global API loading tracking system
 */
export const DailyChartProvider: React.FC<DailyChartProviderProps> = ({
  children,
  selectedDateRange
}) => {
  const { registerApiCall, completeApiCall } = useApiLoadingContext();

  const sharedData = useSharedHoursChart(selectedDateRange, {
    enableRetry: true,
    maxRetries: 3,
    debounceMs: 300,
    onApiStart: () => {
      registerApiCall('daily-chart-shared-api', 'DailyChartProvider', {
        endpoint: 'get_hours_chart',
        priority: 'high',
        description: 'Shared daily chart data for multiple components'
      });
    },
    onApiComplete: (success: boolean) => {
      completeApiCall('daily-chart-shared-api', success);
    },
    onError: (errorMessage: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Shared daily chart API error:', errorMessage);
      }
    }
  });

  return (
    <DailyChartContext.Provider value={sharedData}>
      {children}
    </DailyChartContext.Provider>
  );
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