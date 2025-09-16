/**
 * Conditional logging utility for daily-sales-comparison component
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
const DEBUG_DAILY_SALES = (() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        return false;
    }
    return window.localStorage.getItem('debug:daily-sales') === 'true';
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
        if (!DEBUG_DAILY_SALES) return;

        // Simplify complex objects to prevent performance issues
        const logData =
            data && typeof data === 'object' && !Array.isArray(data)
                ? Object.keys(data).length > 5
                    ? { keys: Object.keys(data), count: Object.keys(data).length }
                    : data
                : data;

        console.debug(`[DailySales] ${message}`, logData);
    },

    /**
     * Warning-level logging - shows in development mode regardless of debug flag
     * @param message - Warning message with component context
     * @param data - Optional data to log
     */
    warn: (message: string, data?: unknown): void => {
        if (process.env.NODE_ENV !== 'development') return;
        console.warn(`[DailySales] ${message}`, data);
    },

    /**
     * Error-level logging - shows in all environments for critical issues
     * @param message - Error message with component context
     * @param data - Optional error data to log
     */
    error: (message: string, data?: unknown): void => {
        console.error(`[DailySales] ${message}`, data);
    },

    /**
     * Conditional info logging - respects debug flag in development
     * @param message - Info message with component context
     * @param data - Optional data to log
     */
    info: (message: string, data?: unknown): void => {
        if (!DEBUG_DAILY_SALES) return;
        console.info(`[DailySales] ${message}`, data);
    },
};

/**
 * Enable debug logging in browser console:
 * localStorage.setItem('debug:daily-sales', 'true')
 *
 * Disable debug logging:
 * localStorage.removeItem('debug:daily-sales')
 */
