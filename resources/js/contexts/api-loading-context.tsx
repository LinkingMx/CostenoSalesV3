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
  setRestoreMode: (isRestore: boolean) => void;
}

const ApiLoadingContext = React.createContext<ApiLoadingContextValue | undefined>(undefined);

interface ApiLoadingProviderProps {
  children: React.ReactNode;
}

export const ApiLoadingProvider: React.FC<ApiLoadingProviderProps> = ({ children }) => {
  const [activeApiCalls, setActiveApiCalls] = React.useState<Map<string, ApiCallInfo>>(new Map());
  const [currentDateRange, setCurrentDateRange] = React.useState<DateRange | undefined>();
  const [isLoadingStarted, setIsLoadingStarted] = React.useState(false);
  const [isRestoreMode, setIsRestoreMode] = React.useState(false);

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
    // Don't show loading if we haven't started any loading process
    if (!isLoadingStarted || totalCallsCount === 0) return false;

    // Check if any calls are actually pending (not using cache)
    const hasPendingCalls = Array.from(activeApiCalls.values()).some(call => call.status === 'pending');

    // Only show loading if we have pending calls that aren't using cache
    return hasPendingCalls && completedCallsCount < totalCallsCount;
  }, [isLoadingStarted, totalCallsCount, completedCallsCount, activeApiCalls]);

  const registerApiCall = React.useCallback((
    id: string,
    componentName: string,
    metadata?: ApiCallMetadata
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Registering API call: ${id} (${componentName}) - Restore mode: ${isRestoreMode}`);
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

    // Don't start loading if we're in restore mode (returning from BranchDetails)
    if (!isLoadingStarted && !isRestoreMode) {
      setIsLoadingStarted(true);
    }
  }, [isLoadingStarted, isRestoreMode]);

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
    // More precise date comparison to avoid false positives
    const hasDateChanged = (() => {
      // Both undefined - no change
      if (!range && !currentDateRange) return false;

      // One undefined, other defined - change
      if (!range || !currentDateRange) return true;

      // Both defined - compare timestamps
      const fromTime1 = range.from?.getTime();
      const toTime1 = range.to?.getTime();
      const fromTime2 = currentDateRange.from?.getTime();
      const toTime2 = currentDateRange.to?.getTime();

      // If any timestamp is invalid, consider it a change
      if (isNaN(fromTime1!) || isNaN(toTime1!) || isNaN(fromTime2!) || isNaN(toTime2!)) {
        return true;
      }

      // Compare timestamps with tolerance for millisecond differences
      const tolerance = 1000; // 1 second tolerance
      return Math.abs(fromTime1! - fromTime2!) > tolerance ||
             Math.abs(toTime1! - toTime2!) > tolerance;
    })();

    if (hasDateChanged) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📅 Date range changed - resetting loading state', {
          from: { old: currentDateRange?.from, new: range?.from },
          to: { old: currentDateRange?.to, new: range?.to }
        });
      }

      setCurrentDateRange(range);
      resetLoadingState();
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📅 Date range unchanged - keeping loading state');
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

  const setRestoreMode = React.useCallback((isRestore: boolean) => {
    setIsRestoreMode(isRestore);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 Restore mode set to: ${isRestore}`);
    }
  }, []);

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
    retryFailedCalls,
    setRestoreMode
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
    retryFailedCalls,
    setRestoreMode
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