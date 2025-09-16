/**
 * Monthly Sales Comparison Utilities - Consolidated Export Module
 *
 * This module re-exports all utility functions from specialized modules.
 * Provides a single import point for backward compatibility while maintaining
 * organized, focused modules for better maintainability.
 */

// Date formatting utilities
export {
    generateMonthDays,
    formatDateForMonthCard,
    getMonthLetter,
    getMonthName,
} from './lib/date-formatting';

// Currency formatting utilities
export {
    formatSalesAmount,
    formatChartAmount,
    formatMonthlySalesAmount,
} from './lib/currency-formatting';

// Validation utilities and type guards
export {
    validateMonthlySalesData,
    validateMonthDateRange,
    isValidApiData,
    isCompleteMonthSelected,
} from './lib/validation';

// API data transformation utilities
export {
    transformApiDataToMonthlySummary,
} from './lib/api-transformation';

// Mock data generation utilities (development only)
export {
    generateMockMonthlySalesData,
} from './lib/mock-data';