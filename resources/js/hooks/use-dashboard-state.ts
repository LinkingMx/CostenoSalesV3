import { type DateRange } from '@/components/main-filter-calendar';
import { useCallback, useState } from 'react';

/**
 * Interface for dashboard state management
 */
interface DashboardState {
    originalDateRange: DateRange | undefined;
    currentDateRange: DateRange | undefined;
    apiResponses: Map<string, { data: any; timestamp: number }>;
    lastUpdated: number;
}

/**
 * Interface for API cache entry
 */
interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

/**
 * Session storage keys
 */
const STORAGE_KEYS = {
    DASHBOARD_STATE: 'dashboard_state',
    API_CACHE: 'dashboard_api_cache',
} as const;

/**
 * Default cache TTL (30 minutes)
 */
const DEFAULT_CACHE_TTL = 30 * 60 * 1000;

/**
 * Custom hook for managing dashboard state with session persistence
 */
export function useDashboardState() {
    // Internal state for the dashboard
    const [state, setState] = useState<DashboardState>(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
            if (stored) {
                const parsed = JSON.parse(stored);

                // Check if stored date is old (from previous day) and clear it
                if (parsed.currentDateRange?.from) {
                    const storedDate = new Date(parsed.currentDateRange.from);
                    const today = new Date();

                    // Normalize dates to midnight for comparison
                    storedDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    // If stored date is not today, clear the state
                    if (storedDate.getTime() !== today.getTime()) {
                        console.log(
                            '🧹 Clearing old dashboard state - stored date was:',
                            storedDate.toDateString(),
                            'but today is:',
                            today.toDateString(),
                        );
                        sessionStorage.removeItem(STORAGE_KEYS.DASHBOARD_STATE);
                        return {
                            originalDateRange: undefined,
                            currentDateRange: undefined,
                            apiResponses: new Map(),
                            lastUpdated: Date.now(),
                        };
                    }
                }

                return {
                    ...parsed,
                    apiResponses: new Map(parsed.apiResponses || []),
                };
            }
        } catch (error) {
            console.warn('Failed to load dashboard state from session storage:', error);
        }

        return {
            originalDateRange: undefined,
            currentDateRange: undefined,
            apiResponses: new Map(),
            lastUpdated: Date.now(),
        };
    });

    // Reserved for future batch update optimization
    // const isDirty = useRef(false);

    /**
     * Save state to session storage
     */
    const saveToStorage = useCallback((newState: DashboardState) => {
        try {
            const toStore = {
                ...newState,
                apiResponses: Array.from(newState.apiResponses.entries()),
            };
            sessionStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, JSON.stringify(toStore));
        } catch (error) {
            console.warn('Failed to save dashboard state to session storage:', error);
        }
    }, []);

    /**
     * Update the dashboard state
     */
    const updateState = useCallback(
        (updates: Partial<DashboardState>) => {
            setState((prevState) => {
                const newState = {
                    ...prevState,
                    ...updates,
                    lastUpdated: Date.now(),
                };

                // Save to storage
                saveToStorage(newState);

                return newState;
            });
        },
        [saveToStorage],
    );

    /**
     * Validate date range to ensure it's valid
     */
    const validateDateRange = useCallback((dateRange: DateRange | undefined): DateRange | undefined => {
        if (!dateRange) return undefined;

        // Check if dates exist and are valid
        if (!dateRange.from || !dateRange.to) return undefined;

        // Ensure dates are Date objects
        const from = dateRange.from instanceof Date ? dateRange.from : new Date(dateRange.from);
        const to = dateRange.to instanceof Date ? dateRange.to : new Date(dateRange.to);

        // Check if dates are valid
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;

        // Check if from date is not after to date
        if (from > to) return undefined;

        // Check if dates are not in the future (with some tolerance)
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (from > tomorrow) return undefined;

        return { from, to };
    }, []);

    /**
     * Set original date range (when first set in dashboard)
     */
    const setOriginalDateRange = useCallback(
        (dateRange: DateRange | undefined) => {
            const validatedRange = validateDateRange(dateRange);
            updateState({
                originalDateRange: validatedRange,
                currentDateRange: validatedRange,
            });
        },
        [updateState, validateDateRange],
    );

    /**
     * Set current date range (can be different from original)
     */
    const setCurrentDateRange = useCallback(
        (dateRange: DateRange | undefined) => {
            const validatedRange = validateDateRange(dateRange);
            updateState({
                currentDateRange: validatedRange,
            });
        },
        [updateState, validateDateRange],
    );

    /**
     * Generate cache key for API responses
     */
    const generateCacheKey = useCallback((componentName: string, dateRange: DateRange | undefined) => {
        const dateKey = dateRange ? `${dateRange.from?.toISOString()}-${dateRange.to?.toISOString()}` : 'no-date';
        return `${componentName}-${dateKey}`;
    }, []);

    /**
     * Check if cache entry is valid
     */
    const isCacheValid = useCallback((entry: CacheEntry): boolean => {
        const now = Date.now();
        return now - entry.timestamp < entry.ttl;
    }, []);

    /**
     * Get cached API response
     */
    const getCachedApiResponse = useCallback(
        (componentName: string, dateRange: DateRange | undefined) => {
            const key = generateCacheKey(componentName, dateRange);
            const entry = state.apiResponses.get(key);

            if (entry && isCacheValid(entry)) {
                return entry.data;
            }

            // Remove expired entry
            if (entry) {
                const newResponses = new Map(state.apiResponses);
                newResponses.delete(key);
                updateState({ apiResponses: newResponses });
            }

            return null;
        },
        [state.apiResponses, generateCacheKey, isCacheValid, updateState],
    );

    /**
     * Cache API response
     */
    const setCachedApiResponse = useCallback(
        (componentName: string, dateRange: DateRange | undefined, data: any, ttl: number = DEFAULT_CACHE_TTL) => {
            const key = generateCacheKey(componentName, dateRange);
            const newResponses = new Map(state.apiResponses);

            newResponses.set(key, {
                data,
                timestamp: Date.now(),
                ttl: ttl,
            });

            updateState({ apiResponses: newResponses });
        },
        [state.apiResponses, generateCacheKey, updateState],
    );

    /**
     * Clear API cache (all or by pattern)
     */
    const clearApiCache = useCallback(
        (pattern?: string) => {
            if (pattern) {
                const newResponses = new Map(state.apiResponses);
                for (const key of newResponses.keys()) {
                    if (key.includes(pattern)) {
                        newResponses.delete(key);
                    }
                }
                updateState({ apiResponses: newResponses });
            } else {
                updateState({ apiResponses: new Map() });
            }
        },
        [state.apiResponses, updateState],
    );

    /**
     * Clear all dashboard state
     */
    const clearDashboardState = useCallback(() => {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.DASHBOARD_STATE);
            sessionStorage.removeItem(STORAGE_KEYS.API_CACHE);
        } catch (error) {
            console.warn('Failed to clear session storage:', error);
        }

        setState({
            originalDateRange: undefined,
            currentDateRange: undefined,
            apiResponses: new Map(),
            lastUpdated: Date.now(),
        });
    }, []);

    /**
     * Check if state is valid (not expired)
     */
    const isStateValid = useCallback(
        (maxAge: number = DEFAULT_CACHE_TTL): boolean => {
            const now = Date.now();
            return now - state.lastUpdated < maxAge;
        },
        [state.lastUpdated],
    );

    /**
     * Restore original date range (for returning from branch details)
     */
    const restoreOriginalDateRange = useCallback(() => {
        updateState({
            currentDateRange: state.originalDateRange,
        });
        return state.originalDateRange;
    }, [state.originalDateRange, updateState]);

    return {
        // State access
        originalDateRange: state.originalDateRange,
        currentDateRange: state.currentDateRange,
        lastUpdated: state.lastUpdated,

        // State setters
        setOriginalDateRange,
        setCurrentDateRange,
        restoreOriginalDateRange,

        // API cache management
        getCachedApiResponse,
        setCachedApiResponse,
        clearApiCache,

        // Utilities
        clearDashboardState,
        isStateValid,
        generateCacheKey,
    };
}
