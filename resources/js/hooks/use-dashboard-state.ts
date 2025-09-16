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
    isUserSelected: boolean; // Track if date range was explicitly selected by user
    userSelectionTimestamp?: number; // When the user made the selection
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
 * User selection TTL (24 hours) - how long to preserve user-selected dates
 */
const USER_SELECTION_TTL = 24 * 60 * 60 * 1000;

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

                console.log('🔍 [useDashboardState] Loading from session storage:', {
                    hasOriginal: !!parsed.originalDateRange,
                    hasCurrent: !!parsed.currentDateRange,
                    originalFrom: parsed.originalDateRange?.from,
                    originalTo: parsed.originalDateRange?.to,
                    currentFrom: parsed.currentDateRange?.from,
                    currentTo: parsed.currentDateRange?.to,
                });

                // Convert string dates back to Date objects
                const restoreDateRange = (range: any): DateRange | undefined => {
                    if (!range || !range.from || !range.to) return undefined;

                    const from = new Date(range.from);
                    const to = new Date(range.to);

                    // Validate the dates are valid
                    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                        console.warn('🔴 Invalid dates found in session storage:', range);
                        return undefined;
                    }

                    return { from, to };
                };

                // Check if stored date is old and should be cleared
                // ONLY clear if it's NOT a user-selected date range OR if user selection has expired
                const isUserSelected = parsed.isUserSelected ?? false;
                const userSelectionTimestamp = parsed.userSelectionTimestamp;

                // Check if user selection has expired (older than 24 hours)
                const isUserSelectionExpired =
                    isUserSelected &&
                    userSelectionTimestamp &&
                    Date.now() - userSelectionTimestamp > USER_SELECTION_TTL;

                if (isUserSelectionExpired) {
                    console.log(
                        '⏰ User-selected date range has expired (older than 24 hours), clearing state',
                    );
                    sessionStorage.removeItem(STORAGE_KEYS.DASHBOARD_STATE);
                    return {
                        originalDateRange: undefined,
                        currentDateRange: undefined,
                        apiResponses: new Map(),
                        lastUpdated: Date.now(),
                        isUserSelected: false,
                        userSelectionTimestamp: undefined,
                    };
                }

                if (!isUserSelected && parsed.currentDateRange?.from) {
                    const storedDate = new Date(parsed.currentDateRange.from);
                    const today = new Date();

                    // Normalize dates to midnight for comparison
                    storedDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    // If stored date is not today AND it's not user-selected, clear the state
                    if (storedDate.getTime() !== today.getTime()) {
                        console.log(
                            '🧹 Clearing old auto-generated dashboard state - stored date was:',
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
                            isUserSelected: false,
                            userSelectionTimestamp: undefined,
                        };
                    }
                } else if (isUserSelected && !isUserSelectionExpired) {
                    const hoursRemaining = userSelectionTimestamp
                        ? Math.round((USER_SELECTION_TTL - (Date.now() - userSelectionTimestamp)) / (60 * 60 * 1000))
                        : 24;
                    console.log('🔒 Preserving user-selected date range:', {
                        from: parsed.originalDateRange?.from,
                        to: parsed.originalDateRange?.to,
                        reason: 'User explicitly selected this date range',
                        expiresInHours: hoursRemaining,
                    });
                }

                const restoredState = {
                    originalDateRange: restoreDateRange(parsed.originalDateRange),
                    currentDateRange: restoreDateRange(parsed.currentDateRange),
                    apiResponses: new Map(parsed.apiResponses || []),
                    lastUpdated: parsed.lastUpdated || Date.now(),
                    isUserSelected: isUserSelected && !isUserSelectionExpired,
                    userSelectionTimestamp: isUserSelectionExpired ? undefined : userSelectionTimestamp,
                };

                console.log('🟢 [useDashboardState] Restored state:', {
                    hasOriginal: !!restoredState.originalDateRange,
                    hasCurrent: !!restoredState.currentDateRange,
                    originalValid: !!(restoredState.originalDateRange?.from && restoredState.originalDateRange?.to),
                    currentValid: !!(restoredState.currentDateRange?.from && restoredState.currentDateRange?.to),
                    isUserSelected: restoredState.isUserSelected,
                    userSelectionTimestamp: restoredState.userSelectionTimestamp,
                });

                return restoredState;
            }
        } catch (error) {
            console.warn('Failed to load dashboard state from session storage:', error);
        }

        console.log('🔵 [useDashboardState] No stored state, initializing fresh');
        return {
            originalDateRange: undefined,
            currentDateRange: undefined,
            apiResponses: new Map(),
            lastUpdated: Date.now(),
            isUserSelected: false,
            userSelectionTimestamp: undefined,
        };
    });

    // Reserved for future batch update optimization
    // const isDirty = useRef(false);

    /**
     * Save state to session storage
     */
    const saveToStorage = useCallback((newState: DashboardState) => {
        try {
            // Convert Date objects to ISO strings for JSON serialization
            const serializeDateRange = (range: DateRange | undefined) => {
                if (!range || !range.from || !range.to) return undefined;
                return {
                    from: range.from instanceof Date ? range.from.toISOString() : range.from,
                    to: range.to instanceof Date ? range.to.toISOString() : range.to,
                };
            };

            const toStore = {
                originalDateRange: serializeDateRange(newState.originalDateRange),
                currentDateRange: serializeDateRange(newState.currentDateRange),
                apiResponses: Array.from(newState.apiResponses.entries()),
                lastUpdated: newState.lastUpdated,
                isUserSelected: newState.isUserSelected,
                userSelectionTimestamp: newState.userSelectionTimestamp,
            };

            sessionStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, JSON.stringify(toStore));

            console.log('💾 [useDashboardState] Saved to session storage:', {
                hasOriginal: !!toStore.originalDateRange,
                hasCurrent: !!toStore.currentDateRange,
                originalFrom: toStore.originalDateRange?.from,
                originalTo: toStore.originalDateRange?.to,
                isUserSelected: toStore.isUserSelected,
                userSelectionTimestamp: toStore.userSelectionTimestamp,
            });
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
     * Marks the range as user-selected if it's not today's date (auto-generated)
     */
    const setOriginalDateRange = useCallback(
        (dateRange: DateRange | undefined, forceUserSelected: boolean = false) => {
            const validatedRange = validateDateRange(dateRange);

            // Determine if this is a user selection vs auto-generated
            let isUserSelection = forceUserSelected;
            if (!forceUserSelected && validatedRange && validatedRange.from && validatedRange.to) {
                // Check if the range is today (auto-generated)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const fromDate = new Date(validatedRange.from);
                fromDate.setHours(0, 0, 0, 0);
                const toDate = new Date(validatedRange.to);
                toDate.setHours(0, 0, 0, 0);

                // If both from and to are today, it's likely auto-generated
                const isToday = fromDate.getTime() === today.getTime() && toDate.getTime() === today.getTime();
                isUserSelection = !isToday;
            }

            console.log('🔵 [useDashboardState] setOriginalDateRange called:', {
                input: dateRange,
                validated: validatedRange,
                isValid: !!validatedRange,
                from: validatedRange?.from?.toISOString(),
                to: validatedRange?.to?.toISOString(),
                isUserSelected: isUserSelection,
                caller: new Error().stack?.split('\n')[2]?.trim(),
            });

            updateState({
                originalDateRange: validatedRange,
                currentDateRange: validatedRange,
                isUserSelected: isUserSelection,
                userSelectionTimestamp: isUserSelection ? Date.now() : undefined,
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
            isUserSelected: false,
            userSelectionTimestamp: undefined,
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
        console.log('🟢 [useDashboardState] restoreOriginalDateRange called:', {
            originalDateRange: state.originalDateRange,
            isValid: !!state.originalDateRange,
            from: state.originalDateRange?.from,
            to: state.originalDateRange?.to,
            fromType: typeof state.originalDateRange?.from,
            toType: typeof state.originalDateRange?.to,
            sessionStorageData: (() => {
                try {
                    const stored = sessionStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        return {
                            hasOriginal: !!parsed.originalDateRange,
                            hasCurrent: !!parsed.currentDateRange,
                            original: parsed.originalDateRange,
                            current: parsed.currentDateRange,
                        };
                    }
                    return null;
                } catch {
                    return 'error parsing session storage';
                }
            })(),
        });

        // Make sure we have valid dates before returning
        if (state.originalDateRange && state.originalDateRange.from && state.originalDateRange.to) {
            updateState({
                currentDateRange: state.originalDateRange,
            });
            return state.originalDateRange;
        }

        console.warn('🔴 [useDashboardState] restoreOriginalDateRange: No valid original date range found!');
        return undefined;
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
