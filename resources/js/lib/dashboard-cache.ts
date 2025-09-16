/**
 * Dashboard Cache Manager
 * Persistent cache layer that survives Inertia.js navigation
 * Uses a combination of in-memory cache and sessionStorage for persistence
 */

import type { DateRange } from '@/components/main-filter-calendar';

interface CacheEntry<T = any> {
    data: T;
    timestamp: number;
    dateRange: {
        from: string;
        to: string;
    };
    ttl: number;
}

interface CacheMetadata {
    lastNavigationTime?: number;
    navigationSource?: 'dashboard' | 'branch-details' | 'other';
    preserveCache?: boolean;
}

/**
 * Interface for cached dashboard state
 */
export interface CachedDashboardState {
    originalDateRange: DateRange | undefined;
    currentDateRange: DateRange | undefined;
    apiResponses: [string, { data: any; timestamp: number; ttl: number }][];
    lastUpdated: number;
    version: string; // For future compatibility
}

/**
 * Interface for API cache entry
 */
export interface ApiCacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

/**
 * Storage keys for session storage
 */
const STORAGE_KEYS = {
    DASHBOARD_STATE: 'costeno_dashboard_state',
    API_CACHE: 'costeno_api_cache',
    VERSION: 'costeno_cache_version',
    METADATA: 'dashboard_cache_metadata',
} as const;

/**
 * Current cache version for compatibility
 */
const CACHE_VERSION = '1.0.0';

/**
 * Default TTL values in milliseconds
 */
export const CACHE_TTL = {
    DEFAULT: 30 * 60 * 1000, // 30 minutes
    SHORT: 5 * 60 * 1000, // 5 minutes
    LONG: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Check if session storage is available
 */
const isSessionStorageAvailable = (): boolean => {
    try {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return false;
        }

        // Test if we can actually use it
        const testKey = '__test_storage__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

/**
 * Safe JSON parse with error handling
 */
const safeParse = <T>(json: string | null, fallback: T): T => {
    if (!json) return fallback;

    try {
        return JSON.parse(json) as T;
    } catch (error) {
        console.warn('Failed to parse JSON from session storage:', error);
        return fallback;
    }
};

/**
 * Safe JSON stringify with error handling
 */
const safeStringify = (data: any): string | null => {
    try {
        return JSON.stringify(data);
    } catch (error) {
        console.warn('Failed to stringify data for session storage:', error);
        return null;
    }
};

/**
 * Load dashboard state from session storage
 */
export const loadDashboardState = (): CachedDashboardState | null => {
    if (!isSessionStorageAvailable()) {
        console.warn('Session storage not available');
        return null;
    }

    try {
        const stored = sessionStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE);
        if (!stored) {
            return null;
        }

        const parsed = safeParse<CachedDashboardState | null>(stored, null);
        if (!parsed) {
            return null;
        }

        // Check version compatibility
        if (parsed.version !== CACHE_VERSION) {
            console.info('Cache version mismatch, clearing old cache');
            clearDashboardState();
            return null;
        }

        return parsed;
    } catch (error) {
        console.warn('Error loading dashboard state:', error);
        return null;
    }
};

/**
 * Save dashboard state to session storage
 */
export const saveDashboardState = (state: Omit<CachedDashboardState, 'version'>): boolean => {
    if (!isSessionStorageAvailable()) {
        console.warn('Session storage not available');
        return false;
    }

    try {
        const stateWithVersion: CachedDashboardState = {
            ...state,
            version: CACHE_VERSION,
        };

        const serialized = safeStringify(stateWithVersion);
        if (!serialized) {
            return false;
        }

        sessionStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, serialized);
        return true;
    } catch (error) {
        console.warn('Error saving dashboard state:', error);

        // If storage quota exceeded, try to clear old data
        if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.info('Storage quota exceeded, clearing cache and retrying');
            clearExpiredCache();

            try {
                const serialized = safeStringify({ ...state, version: CACHE_VERSION });
                if (serialized) {
                    sessionStorage.setItem(STORAGE_KEYS.DASHBOARD_STATE, serialized);
                    return true;
                }
            } catch (retryError) {
                console.error('Failed to save state after clearing cache:', retryError);
            }
        }

        return false;
    }
};

/**
 * Clear dashboard state from session storage
 */
export const clearDashboardState = (): void => {
    if (!isSessionStorageAvailable()) {
        return;
    }

    try {
        sessionStorage.removeItem(STORAGE_KEYS.DASHBOARD_STATE);
        sessionStorage.removeItem(STORAGE_KEYS.API_CACHE);
        console.info('Dashboard state cleared from session storage');
    } catch (error) {
        console.warn('Error clearing dashboard state:', error);
    }
};

/**
 * Check if cached state is still valid
 */
export const isStateValid = (state: CachedDashboardState | null, maxAge: number = CACHE_TTL.DEFAULT): boolean => {
    if (!state) {
        return false;
    }

    const now = Date.now();
    const age = now - state.lastUpdated;

    return age < maxAge;
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
    const state = loadDashboardState();
    if (!state) {
        return;
    }

    const now = Date.now();
    const validEntries: [string, ApiCacheEntry][] = [];

    // Filter out expired entries
    state.apiResponses.forEach(([key, entry]) => {
        if (now - entry.timestamp < entry.ttl) {
            validEntries.push([key, entry]);
        }
    });

    // Save cleaned state
    saveDashboardState({
        ...state,
        apiResponses: validEntries,
        lastUpdated: now,
    });

    console.info(`Cleared ${state.apiResponses.length - validEntries.length} expired cache entries`);
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    totalSize: number;
} => {
    const state = loadDashboardState();
    if (!state) {
        return { totalEntries: 0, validEntries: 0, expiredEntries: 0, totalSize: 0 };
    }

    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    state.apiResponses.forEach(([, entry]) => {
        if (now - entry.timestamp < entry.ttl) {
            validEntries++;
        } else {
            expiredEntries++;
        }
    });

    // Estimate storage size
    const stateString = sessionStorage.getItem(STORAGE_KEYS.DASHBOARD_STATE) || '';
    const totalSize = new Blob([stateString]).size;

    return {
        totalEntries: state.apiResponses.length,
        validEntries,
        expiredEntries,
        totalSize,
    };
};

/**
 * Generate cache key for component + date range combination
 */
export const generateCacheKey = (componentName: string, dateRange: DateRange | undefined, additionalParams?: Record<string, any>): string => {
    const dateKey = dateRange ? `${dateRange.from?.toISOString() || ''}-${dateRange.to?.toISOString() || ''}` : 'no-date';

    const paramsKey = additionalParams
        ? `-${Object.entries(additionalParams)
              .map(([k, v]) => `${k}:${v}`)
              .join('-')}`
        : '';

    return `${componentName}-${dateKey}${paramsKey}`;
};

/**
 * Utility to check storage quota usage
 */
export const getStorageQuotaInfo = (): {
    used: number;
    total: number;
    available: number;
    percentage: number;
} => {
    if (!isSessionStorageAvailable()) {
        return { used: 0, total: 0, available: 0, percentage: 0 };
    }

    try {
        let used = 0;
        for (const key in sessionStorage) {
            if (sessionStorage.hasOwnProperty(key)) {
                used += sessionStorage[key].length + key.length;
            }
        }

        // SessionStorage typically has a 5-10MB limit
        const estimated_total = 5 * 1024 * 1024; // 5MB estimation
        const available = estimated_total - used;
        const percentage = (used / estimated_total) * 100;

        return { used, total: estimated_total, available, percentage };
    } catch (error) {
        console.warn('Error getting storage quota info:', error);
        return { used: 0, total: 0, available: 0, percentage: 0 };
    }
};

/**
 * Dashboard Cache Manager Class
 * Singleton that manages persistent cache across navigation
 */
class DashboardCacheManager {
    private static instance: DashboardCacheManager;
    private memoryCache: Map<string, CacheEntry>;
    private metadata: CacheMetadata;
    private readonly DEFAULT_TTL = 20 * 60 * 1000; // 20 minutes
    private readonly NAVIGATION_GRACE_PERIOD = 5000; // 5 seconds grace period for navigation

    private constructor() {
        this.memoryCache = new Map();
        this.metadata = {};
        this.loadFromStorage();
        this.loadMetadata();
        this.setupNavigationTracking();
    }

    public static getInstance(): DashboardCacheManager {
        if (!DashboardCacheManager.instance) {
            DashboardCacheManager.instance = new DashboardCacheManager();
        }
        return DashboardCacheManager.instance;
    }

    /**
     * Setup navigation tracking to detect when user is navigating back
     */
    private setupNavigationTracking(): void {
        if (typeof window !== 'undefined') {
            // Track Inertia navigation events
            const inertiaApp = (window as any).Inertia || (window as any).inertia;
            if (inertiaApp) {
                inertiaApp.on('navigate', (event: any) => {
                    const { component } = event.detail.page;

                    // If navigating FROM dashboard TO branch details
                    if (component === 'BranchDetails') {
                        this.metadata.navigationSource = 'dashboard';
                        this.metadata.preserveCache = true;
                        this.metadata.lastNavigationTime = Date.now();
                        this.saveMetadata();
                        this.saveToStorage(); // Persist cache before navigation

                        if (process.env.NODE_ENV === 'development') {
                            console.log('📦 Dashboard Cache: Preserving cache before navigation to BranchDetails');
                        }
                    }

                    // If navigating TO dashboard
                    if (component === 'dashboard') {
                        const timeSinceLastNav = Date.now() - (this.metadata.lastNavigationTime || 0);
                        const isReturningFromBranch =
                            this.metadata.navigationSource === 'dashboard' && timeSinceLastNav < this.NAVIGATION_GRACE_PERIOD;

                        if (isReturningFromBranch) {
                            if (process.env.NODE_ENV === 'development') {
                                console.log('📦 Dashboard Cache: Detected return from BranchDetails, preserving cache');
                            }
                            this.metadata.preserveCache = true;
                        } else {
                            this.metadata.preserveCache = false;
                        }

                        this.metadata.navigationSource = 'other';
                        this.saveMetadata();
                    }
                });
            }
        }
    }

    /**
     * Generate a cache key for a component and date range
     */
    public generateKey(componentName: string, dateRange: DateRange | undefined): string {
        if (!dateRange?.from || !dateRange?.to) {
            return `${componentName}:no-date`;
        }

        const fromStr = dateRange.from.toISOString().split('T')[0];
        const toStr = dateRange.to.toISOString().split('T')[0];
        return `${componentName}:${fromStr}:${toStr}`;
    }

    /**
     * Check if cache entry is valid
     */
    private isValidEntry(entry: CacheEntry, dateRange: DateRange | undefined): boolean {
        const now = Date.now();

        // Check TTL
        if (now - entry.timestamp > entry.ttl) {
            return false;
        }

        // Check date range match (with tolerance for millisecond differences)
        if (!dateRange?.from || !dateRange?.to) {
            return !entry.dateRange.from && !entry.dateRange.to;
        }

        const entryFrom = new Date(entry.dateRange.from).getTime();
        const entryTo = new Date(entry.dateRange.to).getTime();
        const requestFrom = dateRange.from.getTime();
        const requestTo = dateRange.to.getTime();

        const tolerance = 1000; // 1 second tolerance
        return Math.abs(entryFrom - requestFrom) < tolerance && Math.abs(entryTo - requestTo) < tolerance;
    }

    /**
     * Get cached data for a component
     */
    public get<T>(componentName: string, dateRange: DateRange | undefined): T | null {
        const key = this.generateKey(componentName, dateRange);

        // First check memory cache
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && this.isValidEntry(memoryEntry, dateRange)) {
            if (process.env.NODE_ENV === 'development') {
                const remainingTTL = Math.round((memoryEntry.ttl - (Date.now() - memoryEntry.timestamp)) / 1000);
                console.log(`💾 Dashboard Cache HIT (memory): ${componentName}, TTL: ${remainingTTL}s`);
            }
            return memoryEntry.data as T;
        }

        // If navigation is happening and we should preserve cache, check storage
        if (this.metadata.preserveCache) {
            const storageData = this.loadFromStorage();
            const storageEntry = storageData.get(key);

            if (storageEntry && this.isValidEntry(storageEntry, dateRange)) {
                // Restore to memory cache
                this.memoryCache.set(key, storageEntry);

                if (process.env.NODE_ENV === 'development') {
                    const remainingTTL = Math.round((storageEntry.ttl - (Date.now() - storageEntry.timestamp)) / 1000);
                    console.log(`💾 Dashboard Cache HIT (storage): ${componentName}, TTL: ${remainingTTL}s`);
                }

                return storageEntry.data as T;
            }
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`💾 Dashboard Cache MISS: ${componentName}`);
        }

        return null;
    }

    /**
     * Set cached data for a component
     */
    public set<T>(componentName: string, dateRange: DateRange | undefined, data: T, ttl?: number): void {
        const key = this.generateKey(componentName, dateRange);

        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            dateRange: {
                from: dateRange?.from?.toISOString() || '',
                to: dateRange?.to?.toISOString() || '',
            },
            ttl: ttl || this.DEFAULT_TTL,
        };

        this.memoryCache.set(key, entry);

        // Also save to storage if we're in a navigation scenario
        if (this.metadata.preserveCache) {
            this.saveToStorage();
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`💾 Dashboard Cache SET: ${componentName}, TTL: ${(ttl || this.DEFAULT_TTL) / 1000}s`);
        }
    }

    /**
     * Check if cache has valid entry for component
     */
    public has(componentName: string, dateRange: DateRange | undefined): boolean {
        return this.get(componentName, dateRange) !== null;
    }

    /**
     * Clear cache for specific component or all
     */
    public clear(componentName?: string): void {
        if (componentName) {
            const keysToDelete: string[] = [];
            for (const key of this.memoryCache.keys()) {
                if (key.startsWith(componentName + ':')) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach((key) => this.memoryCache.delete(key));
        } else {
            this.memoryCache.clear();
        }

        this.saveToStorage();

        if (process.env.NODE_ENV === 'development') {
            console.log(`💾 Dashboard Cache CLEARED: ${componentName || 'ALL'}`);
        }
    }

    /**
     * Force clear all caches including storage
     */
    public forceClear(): void {
        this.memoryCache.clear();
        this.metadata = {};

        if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.removeItem(STORAGE_KEYS.API_CACHE);
            sessionStorage.removeItem(STORAGE_KEYS.METADATA);
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('💾 Dashboard Cache FORCE CLEARED');
        }
    }

    /**
     * Save cache to sessionStorage
     */
    private saveToStorage(): void {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }

        try {
            const cacheData: Record<string, CacheEntry> = {};
            this.memoryCache.forEach((value, key) => {
                cacheData[key] = value;
            });

            sessionStorage.setItem(STORAGE_KEYS.API_CACHE, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save dashboard cache to storage:', error);
        }
    }

    /**
     * Load cache from sessionStorage
     */
    private loadFromStorage(): Map<string, CacheEntry> {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return new Map();
        }

        try {
            const stored = sessionStorage.getItem(STORAGE_KEYS.API_CACHE);
            if (stored) {
                const cacheData = JSON.parse(stored);
                const map = new Map<string, CacheEntry>();

                Object.entries(cacheData).forEach(([key, value]) => {
                    map.set(key, value as CacheEntry);
                });

                return map;
            }
        } catch (error) {
            console.warn('Failed to load dashboard cache from storage:', error);
        }

        return new Map();
    }

    /**
     * Save metadata to sessionStorage
     */
    private saveMetadata(): void {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }

        try {
            sessionStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(this.metadata));
        } catch (error) {
            console.warn('Failed to save cache metadata:', error);
        }
    }

    /**
     * Load metadata from sessionStorage
     */
    private loadMetadata(): void {
        if (typeof window === 'undefined' || !window.sessionStorage) {
            return;
        }

        try {
            const stored = sessionStorage.getItem(STORAGE_KEYS.METADATA);
            if (stored) {
                this.metadata = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load cache metadata:', error);
        }
    }

    /**
     * Check if we should preserve cache (returning from navigation)
     */
    public shouldPreserveCache(): boolean {
        return this.metadata.preserveCache === true;
    }

    /**
     * Reset preserve cache flag
     */
    public resetPreserveFlag(): void {
        this.metadata.preserveCache = false;
        this.saveMetadata();
    }
}

// Export singleton instance
export const dashboardCache = DashboardCacheManager.getInstance();

// Export convenience functions
export const getDashboardCache = <T>(componentName: string, dateRange: DateRange | undefined): T | null => {
    return dashboardCache.get<T>(componentName, dateRange);
};

export const setDashboardCache = <T>(componentName: string, dateRange: DateRange | undefined, data: T, ttl?: number): void => {
    dashboardCache.set(componentName, dateRange, data, ttl);
};

export const hasDashboardCache = (componentName: string, dateRange: DateRange | undefined): boolean => {
    return dashboardCache.has(componentName, dateRange);
};

export const clearDashboardCache = (componentName?: string): void => {
    dashboardCache.clear(componentName);
};

export const forceClearDashboardCache = (): void => {
    dashboardCache.forceClear();
};
