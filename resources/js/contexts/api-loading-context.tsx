import * as React from 'react';
import type { DateRange } from '@/components/main-filter-calendar';

export interface ApiCallInfo {
  id: string;
  componentName: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'completed' | 'failed';
  metadata?: ApiCallMetadata;
}

export interface ApiCallMetadata {
  endpoint?: string;
  priority?: 'high' | 'medium' | 'low';
  retryCount?: number;
  expectedDuration?: number;
  description?: string;
}

interface ApiLoadingContextValue {
  isGlobalLoading: boolean;
  activeApiCalls: Map<string, ApiCallInfo>;
  totalCallsCount: number;
  completedCallsCount: number;
  failedCalls: string[];
  currentDateRange: DateRange | undefined;

  registerApiCall: (id: string, componentName: string, metadata?: ApiCallMetadata) => void;
  completeApiCall: (id: string, success?: boolean) => void;
  resetLoadingState: () => void;
  isAllCallsComplete: () => boolean;
  getLoadingProgress: () => number;
  onDateRangeChange: (range: DateRange | undefined) => void;
  getFailedCallsInfo: () => ApiCallInfo[];
  retryFailedCalls: () => void;
}

const ApiLoadingContext = React.createContext<ApiLoadingContextValue | undefined>(undefined);

interface ApiLoadingProviderProps {
  children: React.ReactNode;
}

export const ApiLoadingProvider: React.FC<ApiLoadingProviderProps> = ({ children }) => {
  const [activeApiCalls, setActiveApiCalls] = React.useState<Map<string, ApiCallInfo>>(new Map());
  const [currentDateRange, setCurrentDateRange] = React.useState<DateRange | undefined>();
  const [isLoadingStarted, setIsLoadingStarted] = React.useState(false);

  const totalCallsCount = React.useMemo(() => activeApiCalls.size, [activeApiCalls]);

  const completedCallsCount = React.useMemo(() => {
    return Array.from(activeApiCalls.values()).filter(call =>
      call.status === 'completed' || call.status === 'failed'
    ).length;
  }, [activeApiCalls]);

  const failedCalls = React.useMemo(() => {
    return Array.from(activeApiCalls.values())
      .filter(call => call.status === 'failed')
      .map(call => call.id);
  }, [activeApiCalls]);

  const isGlobalLoading = React.useMemo(() => {
    if (!isLoadingStarted || totalCallsCount === 0) return false;
    return completedCallsCount < totalCallsCount;
  }, [isLoadingStarted, totalCallsCount, completedCallsCount]);

  const registerApiCall = React.useCallback((
    id: string,
    componentName: string,
    metadata?: ApiCallMetadata
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Registering API call: ${id} (${componentName})`);
    }

    setActiveApiCalls(prev => {
      const newMap = new Map(prev);
      newMap.set(id, {
        id,
        componentName,
        startTime: Date.now(),
        status: 'pending',
        metadata: {
          priority: 'medium',
          retryCount: 0,
          ...metadata
        }
      });
      return newMap;
    });

    if (!isLoadingStarted) {
      setIsLoadingStarted(true);
    }
  }, [isLoadingStarted]);

  const completeApiCall = React.useCallback((id: string, success = true) => {
    setActiveApiCalls(prev => {
      const newMap = new Map(prev);
      const existingCall = newMap.get(id);

      if (existingCall) {
        const updatedCall: ApiCallInfo = {
          ...existingCall,
          endTime: Date.now(),
          status: success ? 'completed' : 'failed'
        };
        newMap.set(id, updatedCall);

        if (process.env.NODE_ENV === 'development') {
          const duration = updatedCall.endTime! - updatedCall.startTime;
          console.log(`${success ? '✅' : '❌'} API call ${success ? 'completed' : 'failed'}: ${id} (${duration}ms)`);
        }
      }

      return newMap;
    });
  }, []);

  const resetLoadingState = React.useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Resetting loading state');
    }

    setActiveApiCalls(new Map());
    setIsLoadingStarted(false);
  }, []);

  const isAllCallsComplete = React.useCallback(() => {
    if (totalCallsCount === 0) return true;
    return completedCallsCount >= totalCallsCount;
  }, [totalCallsCount, completedCallsCount]);

  const getLoadingProgress = React.useCallback(() => {
    if (totalCallsCount === 0) return 100;
    return Math.round((completedCallsCount / totalCallsCount) * 100);
  }, [totalCallsCount, completedCallsCount]);

  const onDateRangeChange = React.useCallback((range: DateRange | undefined) => {
    const hasDateChanged = !range && currentDateRange ||
                          range && !currentDateRange ||
                          range && currentDateRange && (
                            range.from?.getTime() !== currentDateRange.from?.getTime() ||
                            range.to?.getTime() !== currentDateRange.to?.getTime()
                          );

    if (hasDateChanged) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📅 Date range changed - resetting loading state');
      }

      setCurrentDateRange(range);
      resetLoadingState();
    }
  }, [currentDateRange, resetLoadingState]);

  const getFailedCallsInfo = React.useCallback(() => {
    return Array.from(activeApiCalls.values()).filter(call => call.status === 'failed');
  }, [activeApiCalls]);

  const retryFailedCalls = React.useCallback(() => {
    const failedCallsInfo = getFailedCallsInfo();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Retrying ${failedCallsInfo.length} failed API calls`);
    }

    failedCallsInfo.forEach(call => {
      const retryCount = (call.metadata?.retryCount || 0) + 1;
      const maxRetries = 3;

      if (retryCount <= maxRetries) {
        setActiveApiCalls(prev => {
          const newMap = new Map(prev);
          const updatedCall: ApiCallInfo = {
            ...call,
            status: 'pending',
            startTime: Date.now(),
            endTime: undefined,
            metadata: {
              ...call.metadata,
              retryCount
            }
          };
          newMap.set(call.id, updatedCall);
          return newMap;
        });
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Max retries exceeded for API call: ${call.id}`);
        }
      }
    });
  }, [getFailedCallsInfo]);

  const contextValue: ApiLoadingContextValue = React.useMemo(() => ({
    isGlobalLoading,
    activeApiCalls,
    totalCallsCount,
    completedCallsCount,
    failedCalls,
    currentDateRange,
    registerApiCall,
    completeApiCall,
    resetLoadingState,
    isAllCallsComplete,
    getLoadingProgress,
    onDateRangeChange,
    getFailedCallsInfo,
    retryFailedCalls
  }), [
    isGlobalLoading,
    activeApiCalls,
    totalCallsCount,
    completedCallsCount,
    failedCalls,
    currentDateRange,
    registerApiCall,
    completeApiCall,
    resetLoadingState,
    isAllCallsComplete,
    getLoadingProgress,
    onDateRangeChange,
    getFailedCallsInfo,
    retryFailedCalls
  ]);

  return (
    <ApiLoadingContext.Provider value={contextValue}>
      {children}
    </ApiLoadingContext.Provider>
  );
};

export const useApiLoadingContext = (): ApiLoadingContextValue => {
  const context = React.useContext(ApiLoadingContext);
  if (context === undefined) {
    throw new Error('useApiLoadingContext must be used within an ApiLoadingProvider');
  }
  return context;
};

export default ApiLoadingProvider;