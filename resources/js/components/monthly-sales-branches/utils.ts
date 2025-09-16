import type { DateRange } from '@/components/main-filter-calendar';
import { logger } from './lib/logger';
import type { ApiCardData, BranchSalesData } from './types';

/**
 * Memoization cache for expensive transformation operations
 * Helps avoid recalculating the same API data transformations
 */
const transformationCache = new Map<string, BranchSalesData[]>();

/**
 * Creates a cache key for API data transformation memoization
 * @param cardsData - Raw cards data to create key from
 * @returns String cache key based on data structure
 */
function createCacheKey(cardsData: Record<string, ApiCardData>): string {
    try {
        // Create a hash-like key based on the data structure
        const keys = Object.keys(cardsData).sort();
        const values = keys.map(key => {
            const card = cardsData[key];
            return `${card.store_id}-${card.closed_ticket?.money || 0}-${card.percentage?.qty || 0}`;
        });
        return `${keys.length}-${values.join('|')}`;
    } catch {
        // Fallback to timestamp for unique key if hashing fails
        return `fallback-${Date.now()}-${Math.random()}`;
    }
}

/**
 * Determines if the selected date range contains today's date.
 * Used to show/hide open accounts data since open accounts only exist for the current month.
 *
 * @param {DateRange} [dateRange] - Selected date range from calendar
 * @returns {boolean} True if the range contains today's date
 *
 * @example
 * ```tsx
 * const isCurrentMonth = isCurrentMonth(selectedDateRange);
 * // Returns true if today falls within the selected month range
 * ```
 */
export function isCurrentMonth(dateRange?: DateRange): boolean {
    if (!dateRange?.from || !dateRange?.to) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const rangeStart = new Date(dateRange.from);
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(dateRange.to);
    rangeEnd.setHours(23, 59, 59, 999); // End of day

    return today >= rangeStart && today <= rangeEnd;
}

/**
 * Determines if the selected date range represents exactly one complete month.
 * This function is critical for conditional rendering of the MonthlySalesBranches component,
 * ensuring branch data is only displayed for exact month selections.
 *
 * @param {DateRange} [dateRange] - Date range object with optional from/to dates
 * @returns {boolean} true if the date range spans exactly one month (first to last day), false otherwise
 *
 * @description Business logic:
 * - Returns false for undefined/null date ranges (no selection)
 * - Returns false when either from or to date is missing (incomplete selection)
 * - Normalizes both dates to midnight (00:00:00) to ignore time components
 * - Validates that the start date is the first day of the month
 * - Validates that the end date is the last day of the same month
 * - Ensures the range covers exactly one complete month
 *
 * This validation prevents displaying monthly branch data when:
 * - No date is selected (undefined range)
 * - User is in the middle of selecting a range (only from date set)
 * - A partial month or multiple months are selected
 * - The range doesn't start on the first day or end on the last day of the month
 *
 * @example
 * ```typescript
 * // Exact month (January 1 to January 31) - returns true
 * const exactMonth = {
 *   from: new Date('2025-01-01'), // First day of January
 *   to: new Date('2025-01-31')    // Last day of January
 * };
 * isExactMonthSelected(exactMonth); // true
 *
 * // Partial month - returns false
 * const partialMonth = {
 *   from: new Date('2025-01-15'), // Mid-month
 *   to: new Date('2025-01-31')    // Last day
 * };
 * isExactMonthSelected(partialMonth); // false
 *
 * // Multiple months - returns false
 * const twoMonths = {
 *   from: new Date('2025-01-01'), // First day of January
 *   to: new Date('2025-02-28')    // Last day of February
 * };
 * isExactMonthSelected(twoMonths); // false
 *
 * // No selection - returns false
 * isExactMonthSelected(undefined); // false
 * ```
 */
export function isExactMonthSelected(dateRange?: DateRange): boolean {
    // Early return for missing or incomplete date ranges
    if (!dateRange?.from || !dateRange?.to) {
        return false;
    }

    // Create normalized date objects to ignore time components
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    // Normalize to midnight (00:00:00.000) to remove time influence
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);

    // Check if from date is the first day of the month
    if (fromDate.getDate() !== 1) {
        return false;
    }

    // Get the last day of the same month
    const lastDayOfMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
    lastDayOfMonth.setHours(0, 0, 0, 0);

    // Check if to date is the last day of the same month
    return toDate.getTime() === lastDayOfMonth.getTime();
}

/**
 * Formats monetary amounts with Mexican peso symbol and standard formatting.
 * This function ensures consistent currency presentation throughout the application
 * with clean, readable formatting in Mexican pesos.
 *
 * @param {number} amount - Raw monetary value to format
 * @returns {string} Formatted currency string with peso symbol
 *
 * @description Configuration choices:
 * - Uses Mexican locale for number formatting (commas for thousands)
 * - Mexican peso symbol without "MXN" prefix for cleaner display
 * - Fraction digits: Fixed at 2 for consistent monetary precision
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56);   // "$1,234.56"
 * formatCurrency(5780205.65);  // "$5,780,205.65"
 * formatCurrency(0);         // "$0.00"
 * formatCurrency(123.4);     // "$123.40" (always 2 decimal places)
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat} for Intl.NumberFormat documentation
 */
export function formatCurrency(amount: number): string {
    // Handle invalid or non-numeric inputs gracefully
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        logger.warn('Invalid amount provided for currency formatting', { amount });
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
        logger.error('Currency formatting error', error);
        return `$${amount.toFixed(2)}`; // Fallback formatting
    }
}

/**
 * Formats percentage values with consistent decimal precision and Spanish conventions.
 * Used for displaying growth/change indicators in branch sales data.
 *
 * @param {number} percentage - Raw percentage value (e.g., 53.31 for 53.31%)
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
 * formatPercentage(53.31);    // "53.3%"
 * formatPercentage(-15.7);   // "-15.7%"
 * formatPercentage(0);       // "0.0%"
 * formatPercentage(100);     // "100.0%"
 * formatPercentage(5.678);   // "5.7%" (rounded to 1 decimal)
 * ```
 */
export function formatPercentage(percentage: number): string {
    // Handle invalid or non-numeric inputs gracefully
    if (typeof percentage !== 'number' || isNaN(percentage) || !isFinite(percentage)) {
        logger.warn('Invalid percentage provided for formatting', { percentage });
        return '0.0%'; // Fallback to zero percentage
    }

    try {
        return `${percentage.toFixed(1)}%`;
    } catch (error) {
        logger.error('Percentage formatting error', error);
        return `${percentage}%`; // Fallback without decimal precision
    }
}

/**
 * Transforms API cards data to branch sales data format for the monthly component.
 * Converts the raw API response structure into the BranchSalesData interface format.
 *
 * @param {any} cardsData - Raw cards data from the API response (rawApiData.cards)
 * @returns {BranchSalesData[]} Array of transformed branch sales data sorted by total sales
 *
 * @description This function maps the API response structure to our component interface:
 * - Extracts branch name from the object key
 * - Uses numeric store_id as the ID for navigation
 * - Maps monetary values from closed_ticket and open_accounts
 * - Extracts percentage growth from percentage.qty (vs previous month)
 * - Generates avatar from brand first letter
 * - For monthly: openAccounts is always 0, totalSales = closedSales
 * - Sorts results by total sales in descending order
 *
 * @example
 * ```typescript
 * const apiCards = {
 *   "Animal (Calzada)": {
 *     "open_accounts": {"total": 0, "money": 0},
 *     "closed_ticket": {"total": 1990, "money": 5780205.65},
 *     "last_sales": 3770278.40,
 *     "average_ticket": 1034.03,
 *     "percentage": {"icon": "up", "qty": 53.31},
 *     "brand": "ANIMAL",
 *     "region": "AM-AF"
 *   }
 * };
 *
 * const branchData = transformApiCardsToBranchData(apiCards);
 * // Returns BranchSalesData[] sorted by totalSales descending
 * ```
 */
export function transformApiCardsToBranchData(cardsData: Record<string, ApiCardData>): BranchSalesData[] {
    if (!cardsData || typeof cardsData !== 'object') {
        logger.warn('Invalid cardsData provided for transformation');
        return [];
    }

    // Check cache first for performance optimization
    const cacheKey = createCacheKey(cardsData);
    const cachedResult = transformationCache.get(cacheKey);
    if (cachedResult) {
        logger.debug('Using cached transformation result', { cacheKey, branchCount: cachedResult.length });
        return cachedResult;
    }

    try {
        const result = Object.entries(cardsData)
            .map(([branchName, apiData]: [string, ApiCardData]) => {
                // Validate required data structure
                if (!apiData || typeof apiData !== 'object') {
                    logger.warn('Invalid branch data structure', { branchName });
                    return null;
                }

                const { store_id, closed_ticket, percentage, average_ticket, brand, region } = apiData;

                // Validate required fields
                if (store_id === undefined || store_id === null || !closed_ticket || !percentage) {
                    logger.warn('Missing required fields for branch transformation', {
                        branchName,
                        store_id,
                        hasClosed: !!closed_ticket,
                        hasPercentage: !!percentage,
                    });
                    return null;
                }

                // For monthly: open accounts are always 0, total = closed only
                const openAccountsAmount = 0; // Always 0 for monthly view
                const closedAccountsAmount = closed_ticket.money || 0;

                // Debug log for store_id transformation
                logger.debug('Transforming store_id for branch', {
                    store_id,
                    type: typeof store_id,
                    toString: store_id.toString(),
                    branchName,
                });

                const transformedBranch: BranchSalesData = {
                    id: store_id.toString(),
                    name: branchName,
                    totalSales: closedAccountsAmount, // Only closed sales for monthly
                    percentage: percentage.qty || 0,
                    openAccounts: openAccountsAmount, // Always 0 for monthly
                    closedSales: closedAccountsAmount,
                    averageTicket: average_ticket || 0,
                    totalTickets: closed_ticket.total || 0,
                    avatar: brand ? brand.charAt(0).toUpperCase() : branchName.charAt(0).toUpperCase(),
                };

                // Add location if provided
                if (region) {
                    transformedBranch.location = region;
                }

                return transformedBranch;
            })
            .filter((branch): branch is BranchSalesData => branch !== null)
            .sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales descending

        // Cache the result for future use
        transformationCache.set(cacheKey, result);

        // Limit cache size to prevent memory leaks (keep last 10 results)
        if (transformationCache.size > 10) {
            const firstKey = transformationCache.keys().next().value;
            if (firstKey !== undefined) {
                transformationCache.delete(firstKey);
            }
        }

        logger.debug('Cached new transformation result', { cacheKey, branchCount: result.length });
        return result;
    } catch (error) {
        logger.error('API cards transformation error', error);
        return [];
    }
}

/**
 * Sample monthly branch sales data for development and demonstration purposes.
 *
 * This dataset represents realistic monthly branch performance metrics derived from
 * actual business requirements and API structure. It includes various scenarios
 * to test component behavior with different data patterns.
 *
 * @constant {BranchSalesData[]} DUMMY_MONTHLY_BRANCHES_DATA
 *
 * @description Data characteristics:
 * - Mixed performance scenarios (high/low sales, positive/negative growth)
 * - Realistic monetary values in Mexican pesos
 * - Spanish branch names reflecting target market localization
 * - Monthly-specific: All openAccounts are 0
 * - Different location formats (some empty, some detailed)
 * - Percentage values comparing to previous month
 *
 * Data patterns for testing:
 * 1. "Animal (Calzada)" - High sales with strong growth vs previous month
 * 2. "Mochomos (Tijuana)" - Moderate sales with positive growth
 * 3. "Other branches" - Various performance levels for comprehensive testing
 *
 * @example
 * ```tsx
 * // Used as fallback when no live data is available
 * <MonthlySalesBranches
 *   selectedDateRange={dateRange}
 *   branches={DUMMY_MONTHLY_BRANCHES_DATA} // Explicit usage
 * />
 * ```
 *
 * @see {@link BranchSalesData} for interface structure
 */
export const DUMMY_MONTHLY_BRANCHES_DATA: BranchSalesData[] = [
    {
        id: 'animal-calzada',
        name: 'Animal (Calzada)',
        location: 'AM-AF',
        totalSales: 5780205.65,
        percentage: 53.31, // Strong growth vs previous month
        openAccounts: 0, // Always 0 for monthly
        closedSales: 5780205.65,
        averageTicket: 1034.03,
        totalTickets: 1990,
        avatar: 'A',
    },
    {
        id: 'mochomos-tijuana',
        name: 'Mochomos (Tijuana)',
        location: 'AM-AF',
        totalSales: 2433014.71,
        percentage: 3.43, // Moderate growth
        openAccounts: 0,
        closedSales: 2433014.71,
        averageTicket: 1125.35,
        totalTickets: 966,
        avatar: 'M',
    },
    {
        id: 'palominos-plaza',
        name: 'Palominos (Plaza)',
        location: 'CDMX',
        totalSales: 1850000.0,
        percentage: -12.5, // Negative growth for testing
        openAccounts: 0,
        closedSales: 1850000.0,
        averageTicket: 987.5,
        totalTickets: 750,
        avatar: 'P',
    },
    {
        id: 'mercado-reforma',
        name: 'Mercado Reforma',
        location: '',
        totalSales: 1200000.0,
        percentage: 8.2, // Low growth scenario
        openAccounts: 0,
        closedSales: 1200000.0,
        averageTicket: 654.32,
        totalTickets: 450,
        avatar: 'M',
    },
];
