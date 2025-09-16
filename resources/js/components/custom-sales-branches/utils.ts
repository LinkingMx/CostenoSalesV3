import { isCustomRangeSelected } from '@/lib/date-validation';
import type { BranchCustomSalesData } from './types';

// Re-export the custom range validation function
export { isCustomRangeSelected };

/**
 * Formats monetary amounts with dollar symbol and standard formatting.
 * This function ensures consistent currency presentation throughout the application
 * with clean, readable formatting without currency prefix.
 *
 * @param {number} amount - Raw monetary value to format
 * @returns {string} Formatted currency string with dollar symbol only
 *
 * @description Configuration choices:
 * - Uses Mexican Spanish locale for number formatting (es-MX)
 * - Simple peso symbol without "MXN" prefix for cleaner display
 * - Fraction digits: Fixed at 2 for consistent monetary precision
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56);   // "$1,234.56"
 * formatCurrency(74326.60);  // "$74,326.60"
 * formatCurrency(0);         // "$0.00"
 * formatCurrency(123.4);     // "$123.40" (always 2 decimal places)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat} for Intl.NumberFormat documentation
 */
export function formatCurrency(amount: number): string {
    // Handle invalid or non-numeric inputs gracefully
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        console.warn(`formatCurrency: Invalid amount provided: ${amount}`);
        return '$0.00'; // Fallback to zero currency format
    }

    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2, // Always show 2 decimal places
            maximumFractionDigits: 2, // Never exceed 2 decimal places
            currencyDisplay: 'symbol', // Show only $ symbol, not MXN
        }).format(amount);
    } catch (error) {
        console.error('formatCurrency: Formatting error:', error);
        return `$${amount.toFixed(2)}`; // Fallback formatting
    }
}

/**
 * Formats percentage values with consistent decimal precision and Spanish conventions.
 * Used for displaying growth/change indicators in branch sales data.
 *
 * @param {number} percentage - Raw percentage value (e.g., 22.5 for 22.5%)
 * @returns {string} Formatted percentage string with one decimal place
 *
 * @description Formatting choices:
 * - Fixed to 1 decimal place for balance between precision and readability
 * - Handles both positive and negative percentages
 * - Does not include +/- symbols - visual indicators handled by UI components
 *
 * The single decimal precision provides meaningful accuracy for business metrics
 * while maintaining clean, readable display in UI badges and indicators.
 *
 * @example
 * ```typescript
 * formatPercentage(22.5);    // "22.5%"
 * formatPercentage(-15.7);   // "-15.7%"
 * formatPercentage(0);       // "0.0%"
 * formatPercentage(100);     // "100.0%"
 * formatPercentage(5.678);   // "5.7%" (rounded to 1 decimal)
 * ```
 */
export function formatPercentage(percentage: number): string {
    // Handle invalid or non-numeric inputs gracefully
    if (typeof percentage !== 'number' || isNaN(percentage) || !isFinite(percentage)) {
        console.warn(`formatPercentage: Invalid percentage provided: ${percentage}`);
        return '0.0%'; // Fallback to zero percentage
    }

    try {
        return `${percentage.toFixed(1)}%`;
    } catch (error) {
        console.error('formatPercentage: Formatting error:', error);
        return `${percentage}%`; // Fallback without decimal precision
    }
}

/**
 * Sample branch sales data for custom date ranges in development and demonstration purposes.
 *
 * This dataset represents realistic branch performance metrics for custom date ranges
 * derived from actual business requirements and UI mockups. It includes various scenarios
 * to test component behavior with different data patterns.
 *
 * @constant {BranchCustomSalesData[]} DUMMY_CUSTOM_BRANCHES_DATA
 *
 * @description Data characteristics:
 * - Mixed performance scenarios (high/low sales, positive/negative growth)
 * - Realistic monetary values in Mexican pesos (MXN)
 * - Spanish branch names reflecting target market localization
 * - Varied completion states (some branches with incomplete ticket data)
 * - Different location formats (some empty, some detailed)
 *
 * Data patterns for testing:
 * 1. "Lázaro y Diego" - Complete data set with open/closed accounts split
 * 2. "Animal" branches - High growth, closed sales only (no open accounts)
 * 3. "Mercado Reforma" - Moderate growth, empty location field
 *
 * @example
 * ```tsx
 * // Used as default fallback when no live data is available
 * <CustomSalesBranches
 *   selectedDateRange={dateRange}
 *   branches={DUMMY_CUSTOM_BRANCHES_DATA} // Explicit usage
 * />
 *
 * // Automatic fallback (default parameter)
 * <CustomSalesBranches selectedDateRange={dateRange} />
 * ```
 *
 * @see {@link BranchCustomSalesData} for interface structure
 */
export const DUMMY_CUSTOM_BRANCHES_DATA: BranchCustomSalesData[] = [
    {
        id: '5',
        name: 'Lázaro y Diego',
        location: 'Metropolitan', // Full location example
        totalSales: 84326.6,
        percentage: 18.3, // Positive growth
        openAccounts: 7490.6, // Has pending transactions
        closedSales: 76836.0,
        averageTicket: 389.78, // Realistic ticket average
        totalTickets: 112, // Complete ticket data
        avatar: 'L',
    },
    {
        id: '31',
        name: 'Animal',
        location: 'St Regis', // Different location format
        totalSales: 72432.0,
        percentage: 65.8, // High positive growth
        openAccounts: 0, // All sales completed
        closedSales: 72432.0,
        averageTicket: 0, // Missing average data
        totalTickets: 0, // Missing ticket count
        avatar: 'A',
    },
    {
        id: '26',
        name: 'Animal', // Same brand, different location
        location: 'CDMX',
        totalSales: 58035.0,
        percentage: 55.2, // High positive growth
        openAccounts: 0,
        closedSales: 58035.0,
        averageTicket: 0, // Incomplete data scenario
        totalTickets: 0,
        avatar: 'A',
    },
    {
        id: '38',
        name: 'Mercado Reforma',
        location: '', // Empty location example
        totalSales: 50752.3,
        percentage: 16.4, // Moderate positive growth
        openAccounts: 0,
        closedSales: 50752.3,
        averageTicket: 0, // Testing zero values
        totalTickets: 0,
        avatar: 'M',
    },
];
