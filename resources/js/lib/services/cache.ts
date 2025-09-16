/**
 * Cache Implementation
 * Simple in-memory cache with TTL support
 */

import { CacheEntry, CacheOptions } from './types';

class CacheManager {
    private cache: Map<string, CacheEntry<any>>;
    private defaultTTL: number;

    constructor(defaultTTL: number = 20 * 60 * 1000) {
        // 20 minutes default
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    /**
     * Get cached data if valid
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            if (process.env.NODE_ENV === 'development') {
                console.log(`Cache expired for key: ${key}`);
            }
            return null;
        }

        if (process.env.NODE_ENV === 'development') {
            const remainingTime = Math.round((entry.ttl - (now - entry.timestamp)) / 1000);
            console.log(`Cache hit for key: ${key}, remaining TTL: ${remainingTime}s`);
        }

        return entry.data as T;
    }

    /**
     * Set cache data with optional TTL
     */
    set<T>(key: string, data: T, options?: CacheOptions): void {
        const ttl = options?.ttl || this.defaultTTL;

        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl,
        };

        this.cache.set(key, entry);

        if (process.env.NODE_ENV === 'development') {
            console.log(`Cache set for key: ${key}, TTL: ${ttl / 1000}s`);
        }
    }

    /**
     * Check if cache has valid entry
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Clear specific cache entry
     */
    delete(key: string): void {
        this.cache.delete(key);
        if (process.env.NODE_ENV === 'development') {
            console.log(`Cache cleared for key: ${key}`);
        }
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        if (process.env.NODE_ENV === 'development') {
            console.log('All cache cleared');
        }
    }

    /**
     * Get cache size
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Generate cache key from parameters
     */
    static generateKey(...params: any[]): string {
        return params
            .map((param) => {
                if (typeof param === 'object') {
                    return JSON.stringify(param);
                }
                return String(param);
            })
            .join(':');
    }
}

// Export singleton instance with 20 minutes TTL as per requirements
export const cacheManager = new CacheManager(20 * 60 * 1000);

// Export helper functions
export const getCachedData = <T>(key: string): T | null => {
    return cacheManager.get<T>(key);
};

export const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
    cacheManager.set(key, data, { ttl });
};

export const clearCache = (key?: string): void => {
    if (key) {
        cacheManager.delete(key);
    } else {
        cacheManager.clear();
    }
};

export const generateCacheKey = CacheManager.generateKey;
