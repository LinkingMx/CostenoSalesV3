# API Architecture Pattern Guide for Sales Components

## Executive Summary

This comprehensive guide documents the complete API architecture pattern used by the `daily-sales-branches` component, which serves as the reference implementation for all dashboard sales components (weekly, monthly, and custom). This pattern provides a robust, scalable, and performant solution for fetching, processing, and displaying sales data.

**Pattern Name:** Tracked API Call with Smart Caching and Comparison
**Version:** 2.0.0
**Created:** September 14, 2025
**Last Updated:** September 14, 2025
**Status:** Production Ready

## Core Architecture Pattern

### 1. Component Layer Structure

```
component-directory/
├── index.ts                           # Public exports
├── component-name.tsx                 # Main component container
├── types.ts                          # TypeScript interfaces
├── utils.ts                          # Utility functions and mock data
├── components/                       # Sub-components
│   └── item-component.tsx           # Individual item display
└── hooks/                           # Custom hooks
    └── use-component-data.ts        # API integration hook
```

### 2. Service Layer Integration

```
lib/services/
├── main-dashboard.service.ts        # Core API service
├── types.ts                         # Service-specific types
└── cache.ts                         # Cache management
```

### 3. Context Integration

```
contexts/
└── api-loading-context.tsx          # Global API loading state
```

## Detailed Architecture Components

### A. Custom Hook Pattern (`use-branch-sales-data.ts`)

The hook is the central orchestrator that manages:

#### 1. State Management
```typescript
// Core state variables
const [branches, setBranches] = useState<BranchSalesData[]>(fallbackData);
const [totalSales, setTotalSales] = useState<number>(0);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [isFromCache, setIsFromCache] = useState<boolean>(false);
```

#### 2. API Call Tracking
```typescript
// Integration with global API loading context
const { makeTrackedCall } = useTrackedApiCall({
  componentName: 'DailySalesBranches',
  defaultMetadata: {
    endpoint: 'main_dashboard_data',
    priority: 'medium',
    description: 'Branch sales data with week-over-week comparison'
  }
});
```

#### 3. Request Management
```typescript
// Prevent race conditions and enable cancellation
const activeRequestRef = useRef<AbortController | null>(null);
const isMountedRef = useRef<boolean>(true);
const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

#### 4. Memoization Strategy
```typescript
// Optimize re-renders
const memoizedBranches = useMemo(() => branches, [branches]);
const memoizedTotalSales = useMemo(() => totalSales, [totalSales]);
const isVisible = useMemo(() => isSingleDaySelected(selectedDateRange), [selectedDateRange]);
const isTodaySelected = useMemo(() => isSelectedDateToday(selectedDateRange), [selectedDateRange]);
```

#### 5. Data Fetching Logic
```typescript
const fetchData = useCallback(async (isRefresh = false) => {
  // 1. Validation checks
  if (!enabled || !isVisible || !formattedDates) return;

  // 2. Cancel existing requests
  if (activeRequestRef.current) {
    activeRequestRef.current.abort();
  }

  // 3. Create new abort controller
  const abortController = new AbortController();
  activeRequestRef.current = abortController;

  // 4. Set loading state with fallback
  setIsLoading(true);
  if (!isRefresh && useFallbackDuringLoad && fallbackData.length > 0) {
    setBranches(fallbackData);
  }

  // 5. Make tracked API call
  const result = await makeTrackedCall(
    () => fetchMainDashboardData(
      formattedDates.startDate,
      formattedDates.endDate,
      isSingleDay // Include comparison data for single day
    ),
    {
      callId: `branch-sales-${formattedDates.startDate}-${isRefresh ? 'refresh' : 'auto'}`,
      metadata: {
        priority: 'medium',
        description: `Branch sales for ${formattedDates.startDate}`
      }
    }
  );

  // 6. Process result with validation
  if (!abortController.signal.aborted && isMountedRef.current) {
    if (result.error) {
      setError(result.error);
      setBranches(fallbackData.length > 0 ? fallbackData : []);
    } else {
      setBranches(result.branches);
      setTotalSales(result.totalSales);
    }
  }
}, [enabled, isVisible, formattedDates, fallbackData, useFallbackDuringLoad]);
```

#### 6. Effect Management with Debouncing
```typescript
useEffect(() => {
  isMountedRef.current = true;

  if (!isVisible) {
    // Cleanup when not visible
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    // Reset state
    setBranches([]);
    setTotalSales(0);
    setIsLoading(false);
    setError(null);
    return;
  }

  // Debounce fetch by 300ms
  if (fetchTimeoutRef.current) {
    clearTimeout(fetchTimeoutRef.current);
  }

  fetchTimeoutRef.current = setTimeout(() => {
    fetchData();
  }, 300);

  // Cleanup
  return () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
  };
}, [isVisible, formattedDates?.startDate, formattedDates?.endDate, enabled]);
```

### B. Service Layer Pattern (`main-dashboard.service.ts`)

#### 1. Request Deduplication
```typescript
// Track active requests to prevent duplicates
const activeRequests = new Map<string, Promise<any>>();

export const fetchMainDashboardData = async (...args) => {
  const cacheKey = generateCacheKey(...args);

  // Check for existing request
  const activeRequest = activeRequests.get(cacheKey);
  if (activeRequest) {
    return activeRequest;
  }

  // Create new request promise
  const requestPromise = (async () => {
    try {
      // API call logic
      const result = await apiPost(...);
      activeRequests.delete(cacheKey);
      return result;
    } catch (error) {
      activeRequests.delete(cacheKey);
      throw error;
    }
  })();

  activeRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
```

#### 2. Rate Limiting Implementation
```typescript
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  windowMs: 60 * 1000,
  requestCounts: new Map<string, { count: number; resetTime: number }>(),
};

const isWithinRateLimit = (key: string): boolean => {
  const now = Date.now();
  const requestData = RATE_LIMIT.requestCounts.get(key);

  if (!requestData || now >= requestData.resetTime) {
    RATE_LIMIT.requestCounts.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (requestData.count < RATE_LIMIT.maxRequestsPerMinute) {
    requestData.count++;
    return true;
  }

  return false;
};
```

#### 3. Cache Management
```typescript
export const fetchMainDashboardData = async (...) => {
  const cacheKey = generateCacheKey(...);

  // Check cache first
  const cachedData = cacheManager.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Check rate limiting
  if (!isWithinRateLimit(cacheKey)) {
    return {
      branches: [],
      totalSales: 0,
      error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.'
    };
  }

  // Make API call
  const result = await apiCall(...);

  // Cache the result (20 minutes TTL)
  cacheManager.set(cacheKey, result);

  return result;
};
```

#### 4. Comparison Data Fetching
```typescript
// For single day selections, fetch previous week data
if (includePreviousWeek && startDate === endDate) {
  const currentDate = dateFromApiString(startDate);
  const previousWeekDate = getPreviousWeekDate(currentDate);
  const previousWeekDateStr = formatDateForApi(previousWeekDate);

  const previousRequest = {
    start_date: previousWeekDateStr,
    end_date: previousWeekDateStr
  };

  // Fetch previous week data
  const previousResponse = await apiPost(
    API_ENDPOINTS.MAIN_DASHBOARD,
    previousRequest
  );

  // Process with comparison
  const branches = processApiResponse(currentResponse.data, previousResponse?.data);
}
```

#### 5. Data Processing and Transformation
```typescript
const processBranchData = (
  branchName: string,
  branchData: BranchApiData,
  previousBranchData?: BranchApiData
): BranchSalesData => {
  // Calculate totals
  const totalSales = branchData.open_accounts.money + branchData.closed_ticket.money;
  const totalTickets = branchData.open_accounts.total + branchData.closed_ticket.total;

  // Calculate percentage comparison
  let calculatedPercentage = 100;
  let previousWeekSales: number | undefined;

  if (previousBranchData) {
    const previousTotalSales = previousBranchData.open_accounts.money +
                               previousBranchData.closed_ticket.money;
    previousWeekSales = previousTotalSales;

    if (previousTotalSales > 0) {
      calculatedPercentage = ((totalSales - previousTotalSales) / previousTotalSales) * 100;
    } else if (totalSales > 0) {
      calculatedPercentage = 100;
    } else {
      calculatedPercentage = 0;
    }
  }

  // Extract location from branch name
  const locationMatch = branchName.match(/\(([^)]+)\)/);
  const location = locationMatch ? locationMatch[1] : '';

  return {
    id: branchData.store_id.toString(),
    name: branchName,
    location,
    totalSales,
    percentage: calculatedPercentage,
    openAccounts: branchData.open_accounts.money,
    closedSales: branchData.closed_ticket.money,
    averageTicket: branchData.average_ticket,
    totalTickets,
    avatar: branchName.charAt(0).toUpperCase(),
    previousWeekSales,
  };
};
```

### C. Cache Layer Pattern (`cache.ts`)

#### 1. Cache Manager Implementation
```typescript
class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 20 * 60 * 1000) { // 20 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTTL;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    this.cache.set(key, entry);
  }
}

// Singleton instance
export const cacheManager = new CacheManager(20 * 60 * 1000);
```

#### 2. Cache Key Generation
```typescript
export const generateCacheKey = (...params: any[]): string => {
  return params
    .map(param => {
      if (typeof param === 'object') {
        return JSON.stringify(param);
      }
      return String(param);
    })
    .join(':');
};

// Usage example
const cacheKey = generateCacheKey(
  'main-dashboard',
  startDate,
  endDate,
  includePreviousWeek ? 'with-prev' : 'no-prev'
);
```

### D. API Loading Context Pattern

#### 1. Global Loading State Management
```typescript
interface ApiLoadingContextValue {
  isGlobalLoading: boolean;
  activeApiCalls: Map<string, ApiCallInfo>;
  totalCallsCount: number;
  completedCallsCount: number;
  failedCalls: string[];

  registerApiCall: (id: string, componentName: string, metadata?: ApiCallMetadata) => void;
  completeApiCall: (id: string, success?: boolean) => void;
  resetLoadingState: () => void;
  getLoadingProgress: () => number;
  retryFailedCalls: () => void;
}
```

#### 2. Tracked API Call Hook
```typescript
export function useTrackedApiCall(options: UseTrackedApiCallOptions) {
  const {
    registerApiCall,
    completeApiCall,
    getFailedCallsInfo,
    retryFailedCalls
  } = useApiLoadingContext();

  const makeTrackedCall = useCallback(async <T,>(
    apiFunction: () => Promise<T>,
    callOptions?: {
      callId?: string;
      metadata?: Partial<ApiCallMetadata>;
    }
  ): Promise<T> => {
    const callId = callOptions?.callId || generateCallId();

    registerApiCall(callId, componentName, metadata);

    try {
      const result = await apiFunction();
      completeApiCall(callId, true);
      return result;
    } catch (error) {
      completeApiCall(callId, false);

      if (autoRetry && retryCount < maxRetries) {
        // Exponential backoff retry
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        return makeTrackedCall(apiFunction, {
          ...callOptions,
          metadata: { ...metadata, retryCount: retryCount + 1 }
        });
      }

      throw error;
    }
  }, [componentName, defaultMetadata, autoRetry, maxRetries]);

  return { makeTrackedCall, retryComponentCalls };
}
```

## Component Pattern Implementation

### A. Main Component Structure

```typescript
export function DailySalesBranches({
  selectedDateRange,
  branches: staticBranches
}: DailySalesBranchesProps) {
  // 1. Use the API integration hook
  const {
    branches,
    isLoading,
    error,
    isVisible,
    isToday,
    refresh,
    clearError
  } = useBranchSalesData(selectedDateRange, {
    enabled: !staticBranches,
    fallbackData: DUMMY_BRANCHES_DATA,
    useFallbackDuringLoad: true
  });

  // 2. Use static or API data
  const displayBranches = staticBranches || branches;

  // 3. Memoize and sort data
  const sortedBranches = useMemo(() => {
    if (!Array.isArray(displayBranches)) return [];

    const validBranches = displayBranches.filter(branch =>
      branch && branch.id && typeof branch.name === 'string'
    );

    return validBranches.sort((a, b) => b.totalSales - a.totalSales);
  }, [displayBranches]);

  // 4. Conditional rendering
  if (!isVisible) return null;

  // 5. State-based rendering
  if (isLoading && sortedBranches.length === 0) {
    return <LoadingState />;
  }

  if (error && sortedBranches.length === 0) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  if (sortedBranches.length === 0) {
    return <EmptyState />;
  }

  // 6. Success state
  return (
    <Card>
      <CardContent>
        <Header showRefreshButton={!staticBranches} />
        {error && <ErrorBanner error={error} onDismiss={clearError} />}
        <BranchList branches={sortedBranches} isToday={isToday} />
        {isLoading && <LoadingOverlay />}
      </CardContent>
    </Card>
  );
}
```

## Replication Guide for Other Components

### Step 1: Create Component Structure

```bash
# Create directory structure for new component (e.g., weekly-sales-branches)
mkdir -p resources/js/components/weekly-sales-branches/{components,hooks}
touch resources/js/components/weekly-sales-branches/{index.ts,weekly-sales-branches.tsx,types.ts,utils.ts}
touch resources/js/components/weekly-sales-branches/hooks/use-weekly-sales-data.ts
touch resources/js/components/weekly-sales-branches/components/weekly-item.tsx
```

### Step 2: Define Types

```typescript
// types.ts
export interface WeeklySalesData {
  id: string;
  weekLabel: string;
  startDate: Date;
  endDate: Date;
  totalSales: number;
  dailyBreakdown: DailyData[];
  percentage: number;
  previousPeriodSales?: number;
}

export interface WeeklySalesProps {
  selectedDateRange?: DateRange;
  data?: WeeklySalesData[];
}
```

### Step 3: Implement Custom Hook

```typescript
// hooks/use-weekly-sales-data.ts
export function useWeeklySalesData(
  selectedDateRange?: DateRange,
  options: UseWeeklySalesDataOptions = {}
) {
  // 1. Setup state management
  const [data, setData] = useState<WeeklySalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Setup API tracking
  const { makeTrackedCall } = useTrackedApiCall({
    componentName: 'WeeklySalesBranches',
    defaultMetadata: {
      endpoint: 'main_dashboard_data',
      priority: 'medium'
    }
  });

  // 3. Setup request management
  const activeRequestRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // 4. Implement visibility logic
  const isVisible = useMemo(() => {
    return isCompleteWeekSelected(selectedDateRange);
  }, [selectedDateRange]);

  // 5. Implement fetch logic
  const fetchData = useCallback(async () => {
    if (!isVisible) return;

    // Cancel existing requests
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    const abortController = new AbortController();
    activeRequestRef.current = abortController;

    setIsLoading(true);

    try {
      const result = await makeTrackedCall(
        () => fetchWeeklyData(selectedDateRange),
        { callId: `weekly-${Date.now()}` }
      );

      if (!abortController.signal.aborted && isMountedRef.current) {
        setData(result.data);
        setError(null);
      }
    } catch (err) {
      if (!abortController.signal.aborted && isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isVisible, selectedDateRange]);

  // 6. Setup effect with debouncing
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, [fetchData]);

  // 7. Return memoized values
  return useMemo(() => ({
    data,
    isLoading,
    error,
    isVisible,
    refresh: fetchData
  }), [data, isLoading, error, isVisible, fetchData]);
}
```

### Step 4: Implement Service Function

```typescript
// lib/services/weekly-dashboard.service.ts
export const fetchWeeklyData = async (
  dateRange: DateRange,
  includeComparison: boolean = true
): Promise<{ data: WeeklySalesData[]; totalSales: number }> => {
  const cacheKey = generateCacheKey('weekly', dateRange, includeComparison);

  // Check cache
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;

  // Check active requests
  const active = activeRequests.get(cacheKey);
  if (active) return active;

  // Check rate limiting
  if (!isWithinRateLimit(cacheKey)) {
    return { data: [], totalSales: 0, error: 'Rate limit exceeded' };
  }

  // Create request promise
  const requestPromise = (async () => {
    try {
      // Current period
      const currentResponse = await apiPost(API_ENDPOINTS.MAIN_DASHBOARD, {
        start_date: formatDateForApi(dateRange.from),
        end_date: formatDateForApi(dateRange.to)
      });

      // Previous period (if needed)
      let previousResponse;
      if (includeComparison) {
        const previousRange = getPreviousWeekRange(dateRange);
        previousResponse = await apiPost(API_ENDPOINTS.MAIN_DASHBOARD, {
          start_date: formatDateForApi(previousRange.from),
          end_date: formatDateForApi(previousRange.to)
        });
      }

      // Process data
      const processedData = processWeeklyResponse(
        currentResponse.data,
        previousResponse?.data
      );

      // Cache result
      cacheManager.set(cacheKey, processedData);

      // Clean up active request
      activeRequests.delete(cacheKey);

      return processedData;
    } catch (error) {
      activeRequests.delete(cacheKey);
      throw error;
    }
  })();

  activeRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
```

## Performance Optimization Strategies

### 1. Request Optimization
- **Deduplication:** Prevent duplicate concurrent requests
- **Rate Limiting:** 10 requests per minute per endpoint
- **Request Cancellation:** Abort outdated requests
- **Debouncing:** 300ms delay for user interactions

### 2. Cache Optimization
- **TTL Management:** 20-minute default cache lifetime
- **Key Generation:** Consistent, deterministic cache keys
- **Memory Management:** Automatic cleanup of expired entries
- **Selective Invalidation:** Clear specific cache entries

### 3. React Optimization
- **Memoization:** useMemo for expensive calculations
- **Callback Stability:** useCallback for function props
- **Dependency Management:** Optimized dependency arrays
- **Component Splitting:** Lazy loading for large components

### 4. Data Processing
- **Stream Processing:** Process data as it arrives
- **Batch Operations:** Group related API calls
- **Parallel Fetching:** Concurrent requests when possible
- **Progressive Enhancement:** Show partial data while loading

## Error Handling Patterns

### 1. Network Errors
```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Retry with exponential backoff
    return retryWithBackoff(apiCall, { maxRetries: 3 });
  }
  throw error;
}
```

### 2. Validation Errors
```typescript
const validateResponse = (response: any): boolean => {
  if (!response?.success) return false;
  if (!response?.data?.cards) return false;
  if (!Array.isArray(Object.keys(response.data.cards))) return false;
  return true;
};
```

### 3. Rate Limiting
```typescript
if (!isWithinRateLimit(key)) {
  return {
    error: 'Demasiadas solicitudes. Por favor, espere antes de actualizar.',
    canRetryAt: getRateLimitResetTime(key)
  };
}
```

### 4. Graceful Degradation
```typescript
const result = await fetchData().catch(error => {
  console.error('Failed to fetch fresh data:', error);

  // Try cache even if expired
  const staleCache = cacheManager.getStale(cacheKey);
  if (staleCache) {
    return { ...staleCache, isStale: true };
  }

  // Fall back to mock data
  return { data: FALLBACK_DATA, isFallback: true };
});
```

## Testing Strategy

### 1. Unit Tests
```typescript
describe('useBranchSalesData', () => {
  it('should fetch data on mount', async () => {
    const { result } = renderHook(() =>
      useBranchSalesData(singleDayRange)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.branches).toHaveLength(5);
    });
  });

  it('should handle rate limiting', async () => {
    // Simulate rate limit
    for (let i = 0; i < 11; i++) {
      await fetchMainDashboardData('2025-09-14', '2025-09-14');
    }

    const result = await fetchMainDashboardData('2025-09-14', '2025-09-14');
    expect(result.error).toContain('Demasiadas solicitudes');
  });
});
```

### 2. Integration Tests
```typescript
describe('API Integration', () => {
  it('should fetch and process comparison data', async () => {
    const current = await fetchMainDashboardData('2025-09-14', '2025-09-14', true);

    expect(current.branches[0]).toHaveProperty('previousWeekSales');
    expect(current.branches[0].percentage).toBeDefined();
  });
});
```

### 3. Performance Tests
```typescript
describe('Performance', () => {
  it('should serve cached requests within 50ms', async () => {
    // Prime cache
    await fetchMainDashboardData('2025-09-14', '2025-09-14');

    // Measure cached response
    const start = performance.now();
    await fetchMainDashboardData('2025-09-14', '2025-09-14');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(50);
  });
});
```

## Migration Checklist for New Components

### Pre-Implementation
- [ ] Define component requirements and data structure
- [ ] Identify API endpoints and request/response formats
- [ ] Plan visibility logic (when to show/hide component)
- [ ] Design comparison strategy (previous period logic)

### Implementation
- [ ] Create directory structure following the pattern
- [ ] Define TypeScript interfaces in types.ts
- [ ] Implement custom hook with API integration
- [ ] Add service layer functions
- [ ] Create main component with state management
- [ ] Implement sub-components for items
- [ ] Add utility functions and mock data

### Integration
- [ ] Connect to API loading context
- [ ] Implement cache management
- [ ] Add rate limiting protection
- [ ] Setup request deduplication
- [ ] Configure error handling
- [ ] Add loading and error states

### Optimization
- [ ] Add memoization for expensive operations
- [ ] Implement request debouncing
- [ ] Setup request cancellation
- [ ] Add progressive data loading
- [ ] Optimize re-render performance

### Testing
- [ ] Write unit tests for hooks
- [ ] Add integration tests for API calls
- [ ] Test error scenarios
- [ ] Verify performance benchmarks
- [ ] Test cache behavior

### Documentation
- [ ] Document API endpoints and formats
- [ ] Add JSDoc comments to functions
- [ ] Create usage examples
- [ ] Document known limitations
- [ ] Add troubleshooting guide

## Common Pitfalls and Solutions

### 1. Infinite Re-render Loop
**Problem:** Component continuously re-renders due to dependency issues
**Solution:** Carefully manage useEffect dependencies, avoid including callbacks that change on every render

### 2. Memory Leaks
**Problem:** Subscriptions and timers not cleaned up
**Solution:** Always return cleanup functions in useEffect

### 3. Race Conditions
**Problem:** Multiple concurrent requests causing state inconsistencies
**Solution:** Use AbortController and request deduplication

### 4. Cache Invalidation
**Problem:** Stale data displayed after updates
**Solution:** Implement smart cache invalidation on data mutations

### 5. Rate Limiting
**Problem:** Too many API calls triggering rate limits
**Solution:** Implement client-side rate limiting and request batching

## Conclusion

This architecture pattern provides a robust, scalable foundation for building dashboard components with complex data requirements. By following this pattern, developers can create components that are:

- **Performant:** With caching, deduplication, and optimization
- **Reliable:** With error handling and graceful degradation
- **Maintainable:** With clear separation of concerns
- **Testable:** With dependency injection and mocking support
- **User-Friendly:** With loading states and error recovery

The pattern has been battle-tested in production with the `daily-sales-branches` component and is ready for replication across weekly, monthly, and custom sales components.

## Appendix: Quick Reference

### Key Files and Their Roles
- **Hook (use-*-data.ts):** Orchestrates data fetching and state management
- **Service (*.service.ts):** Handles API calls and data processing
- **Cache (cache.ts):** Manages data caching with TTL
- **Context (api-loading-context.tsx):** Tracks global loading state
- **Types (types.ts):** Defines all TypeScript interfaces
- **Utils (utils.ts):** Contains helper functions and mock data

### Performance Metrics
- Cache TTL: 20 minutes
- Rate Limit: 10 requests/minute
- Debounce Delay: 300ms
- Retry Attempts: 3
- Exponential Backoff: 1s, 2s, 4s

### API Configuration
- Base URL: `http://192.168.100.20/api/`
- Timeout: 30 seconds
- Auth: Bearer token (hardcoded)
- Content-Type: application/json

### Component Lifecycle
1. Mount → Check visibility
2. Visible → Debounce → Fetch data
3. Loading → Show skeleton/fallback
4. Success → Display data
5. Error → Show error with retry
6. Unmount → Cancel requests, cleanup