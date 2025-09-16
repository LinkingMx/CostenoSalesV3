/**
 * Conditional logging utility for weekly-sales-branches component
 *
 * Features:
 * - Development-only logging with localStorage debug flag control
 * - Performance-optimized with early returns
 * - Consistent prefix for easy filtering
 * - Reduced object complexity in logs
 * - Warning-level logging that respects development mode
 */

/**
 * Debug flag check - only computed once per module load for performance
 */
const DEBUG_WEEKLY_BRANCHES = (() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        return false;
    }
    return window.localStorage.getItem('debug:weekly-branches') === 'true';
})();

/**
 * Logging utility with conditional output based on environment and debug flags
 */
export const logger = {
    /**
     * Debug-level logging - only shows when debug flag is enabled in development
     * @param message - Log message with component context
     * @param data - Optional data to log (keep simple for performance)
     */
    debug: (message: string, data?: unknown): void => {
        if (!DEBUG_WEEKLY_BRANCHES) return;

        // Simplify complex objects to prevent performance issues
        const logData =
            data && typeof data === 'object' && !Array.isArray(data)
                ? Object.keys(data).length > 5
                    ? { keys: Object.keys(data), count: Object.keys(data).length }
                    : data
                : data;

        console.debug(`[WeeklyBranches] ${message}`, logData);
    },

    /**
     * Warning-level logging - shows in development mode regardless of debug flag
     * @param message - Warning message with component context
     * @param data - Optional data to log
     */
    warn: (message: string, data?: unknown): void => {
        if (process.env.NODE_ENV !== 'development') return;
        console.warn(`[WeeklyBranches] ${message}`, data);
    },

    /**
     * Error-level logging - shows in all environments for critical issues
     * @param message - Error message with component context
     * @param data - Optional error data to log
     */
    error: (message: string, data?: unknown): void => {
        console.error(`[WeeklyBranches] ${message}`, data);
    },

    /**
     * Conditional info logging - respects debug flag in development
     * @param message - Info message with component context
     * @param data - Optional data to log
     */
    info: (message: string, data?: unknown): void => {
        if (!DEBUG_WEEKLY_BRANCHES) return;
        console.info(`[WeeklyBranches] ${message}`, data);
    },
};

/**
 * Enable debug logging in browser console:
 * localStorage.setItem('debug:weekly-branches', 'true')
 *
 * Disable debug logging:
 * localStorage.removeItem('debug:weekly-branches')
 */