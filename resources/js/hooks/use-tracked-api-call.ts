import * as React from 'react';
import { useApiLoadingContext, type ApiCallMetadata } from '@/contexts/api-loading-context';

export interface UseTrackedApiCallOptions {
  componentName: string;
  defaultMetadata?: Partial<ApiCallMetadata>;
  autoRetry?: boolean;
  maxRetries?: number;
}

export interface TrackedApiCallResult<T = any> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  retry: () => void;
}

export function useTrackedApiCall(options: UseTrackedApiCallOptions) {
  const {
    registerApiCall,
    completeApiCall,
    getFailedCallsInfo,
    retryFailedCalls
  } = useApiLoadingContext();

  const {
    componentName,
    defaultMetadata = {},
    autoRetry = true,
    maxRetries = 3
  } = options;

  const makeTrackedCall = React.useCallback(async <T,>(
    apiFunction: () => Promise<T>,
    callOptions?: {
      callId?: string;
      metadata?: Partial<ApiCallMetadata>;
      onStart?: () => void;
      onComplete?: (result: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T> => {
    const {
      callId = `${componentName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata = {},
      onStart,
      onComplete,
      onError
    } = callOptions || {};

    const combinedMetadata: ApiCallMetadata = {
      priority: 'medium',
      retryCount: 0,
      description: `API call from ${componentName}`,
      ...defaultMetadata,
      ...metadata
    };

    registerApiCall(callId, componentName, combinedMetadata);

    if (onStart) {
      onStart();
    }

    try {
      const result = await apiFunction();
      completeApiCall(callId, true);

      if (onComplete) {
        onComplete(result);
      }

      return result;
    } catch (error) {
      const errorObj = error as Error;
      completeApiCall(callId, false);

      if (onError) {
        onError(errorObj);
      }

      if (autoRetry && (combinedMetadata.retryCount || 0) < maxRetries) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Auto-retrying failed API call: ${callId}`);
        }

        const delay = Math.min(1000 * Math.pow(2, combinedMetadata.retryCount || 0), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        return makeTrackedCall(apiFunction, {
          ...callOptions,
          metadata: {
            ...combinedMetadata,
            retryCount: (combinedMetadata.retryCount || 0) + 1
          }
        });
      }

      throw errorObj;
    }
  }, [
    componentName,
    defaultMetadata,
    autoRetry,
    maxRetries,
    registerApiCall,
    completeApiCall
  ]);

  // Note: makeTrackedCallWithState removed due to React hooks rules violations
  // Use makeTrackedCall directly with state management in your components instead

  const retryComponentCalls = React.useCallback(() => {
    const failedCalls = getFailedCallsInfo().filter(call => call.componentName === componentName);

    if (failedCalls.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Retrying ${failedCalls.length} failed calls for ${componentName}`);
      }
      retryFailedCalls();
    }
  }, [componentName, getFailedCallsInfo, retryFailedCalls]);

  const batchTrackedCalls = React.useCallback(async <T,>(
    apiCalls: Array<{
      id: string;
      apiFunction: () => Promise<T>;
      metadata?: Partial<ApiCallMetadata>;
    }>,
    options?: {
      batchId?: string;
      sequential?: boolean;
      continueOnError?: boolean;
    }
  ): Promise<Array<{ id: string; result?: T; error?: Error }>> => {
    const {
      batchId = `batch-${componentName}-${Date.now()}`,
      sequential = false,
      continueOnError = true
    } = options || {};

    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Starting batch API calls: ${batchId} (${apiCalls.length} calls)`);
    }

    const results: Array<{ id: string; result?: T; error?: Error }> = [];

    if (sequential) {
      for (const call of apiCalls) {
        try {
          const result = await makeTrackedCall(call.apiFunction, {
            callId: `${batchId}-${call.id}`,
            metadata: call.metadata
          });
          results.push({ id: call.id, result });
        } catch (error) {
          const errorObj = error as Error;
          results.push({ id: call.id, error: errorObj });

          if (!continueOnError) {
            break;
          }
        }
      }
    } else {
      const promises = apiCalls.map(async call => {
        try {
          const result = await makeTrackedCall(call.apiFunction, {
            callId: `${batchId}-${call.id}`,
            metadata: call.metadata
          });
          return { id: call.id, result };
        } catch (error) {
          const errorObj = error as Error;
          return { id: call.id, error: errorObj };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    if (process.env.NODE_ENV === 'development') {
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;
      console.log(`📦 Batch ${batchId} completed: ${successful} successful, ${failed} failed`);
    }

    return results;
  }, [componentName, makeTrackedCall]);

  return {
    makeTrackedCall,
    retryComponentCalls,
    batchTrackedCalls
  };
}

export default useTrackedApiCall;