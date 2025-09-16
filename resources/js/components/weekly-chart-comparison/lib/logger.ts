/**
 * Conditional logging utility for weekly-chart-comparison component
 *
 * Features:
 * - Development-only logging with localStorage debug flag control
 * - Performance-optimized with early returns
 * - Consistent prefix for easy filtering
 * - Reduced object complexity in logs
 * - Extreme conditional console.trace for deep debugging only
 * - Warning-level logging that respects development mode
 */

/**
 * Debug flag check - only computed once per module load for performance
 */
const DEBUG_WEEKLY_CHART = (() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        return false;
    }
    return window.localStorage.getItem('debug:weekly-chart') === 'true';
})();

/**
 * Deep debugging flag - extremely conditional, only for stack trace analysis
 */
const DEBUG_WEEKLY_CHART_DEEP = (() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        return false;
    }
    return window.localStorage.getItem('debug:weekly-chart-deep') === 'true';
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
        if (!DEBUG_WEEKLY_CHART) return;

        // Simplify complex objects to prevent performance issues
        const logData =
            data && typeof data === 'object' && !Array.isArray(data)
                ? Object.keys(data).length > 5
                    ? { keys: Object.keys(data), count: Object.keys(data).length }
                    : data
                : data;

        console.debug(`[WeeklyChart] ${message}`, logData);
    },

    /**
     * Warning-level logging - shows in development mode regardless of debug flag
     * @param message - Warning message with component context
     * @param data - Optional data to log
     */
    warn: (message: string, data?: unknown): void => {
        if (process.env.NODE_ENV !== 'development') return;
        console.warn(`[WeeklyChart] ${message}`, data);
    },

    /**
     * Error-level logging - shows in all environments for critical issues
     * @param message - Error message with component context
     * @param data - Optional error data to log
     */
    error: (message: string, data?: unknown): void => {
        console.error(`[WeeklyChart] ${message}`, data);
    },

    /**
     * Conditional info logging - respects debug flag in development
     * @param message - Info message with component context
     * @param data - Optional data to log
     */
    info: (message: string, data?: unknown): void => {
        if (!DEBUG_WEEKLY_CHART) return;
        console.info(`[WeeklyChart] ${message}`, data);
    },

    /**
     * EXTREMELY conditional trace logging - only for deep debugging
     * This is performance-costly and should only be used when absolutely necessary
     * @param message - Trace message with component context
     */
    trace: (message: string): void => {
        if (!DEBUG_WEEKLY_CHART_DEEP) return;

        console.groupCollapsed(`[WeeklyChart] 🔍 ${message}`);
        console.trace();
        console.groupEnd();
    },

    /**
     * Performance-optimized request logging for API calls
     * Logs essential information without complex object serialization
     * @param requestId - Unique identifier for the request
     * @param startDate - API start date
     * @param endDate - API end date
     * @param status - Request status ('starting', 'success', 'error')
     */
    request: (requestId: string, startDate: string, endDate: string, status: 'starting' | 'success' | 'error'): void => {
        if (!DEBUG_WEEKLY_CHART) return;

        const statusEmoji = status === 'starting' ? '🔍' : status === 'success' ? '✅' : '❌';
        console.debug(`[WeeklyChart] ${statusEmoji} API Request ${status}: ${requestId} (${startDate} → ${endDate})`);
    },

    /**
     * Effect lifecycle logging - simplified for performance
     * @param effectId - Unique effect identifier
     * @param action - Effect action ('triggered', 'cancelled', 'cleanup')
     * @param isValid - Whether the effect conditions are valid
     */
    effect: (effectId: string, action: 'triggered' | 'cancelled' | 'cleanup', isValid?: boolean): void => {
        if (!DEBUG_WEEKLY_CHART) return;

        const actionEmoji = action === 'triggered' ? '🔄' : action === 'cancelled' ? '⛔' : '🧹';
        const validText = isValid !== undefined ? ` (valid: ${isValid})` : '';
        console.debug(`[WeeklyChart] ${actionEmoji} Effect ${action}: ${effectId}${validText}`);
    },
};

/**
 * Enable debug logging in browser console:
 * localStorage.setItem('debug:weekly-chart', 'true')
 *
 * Enable deep debugging (includes expensive console.trace):
 * localStorage.setItem('debug:weekly-chart-deep', 'true')
 *
 * Disable debug logging:
 * localStorage.removeItem('debug:weekly-chart')
 * localStorage.removeItem('debug:weekly-chart-deep')
 */