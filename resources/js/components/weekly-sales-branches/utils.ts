import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchSalesData } from './types';

/**
 * Determines if the selected date range represents exactly one week (Monday to Sunday).
 * This function is critical for conditional rendering of the WeeklySalesBranches component,
 * ensuring branch data is only displayed for exact week selections.
 * 
 * @param {DateRange} [dateRange] - Date range object with optional from/to dates
 * @returns {boolean} true if the date range spans exactly one week (Monday to Sunday), false otherwise
 * 
 * @description Business logic:
 * - Returns false for undefined/null date ranges (no selection)
 * - Returns false when either from or to date is missing (incomplete selection)
 * - Normalizes both dates to midnight (00:00:00) to ignore time components
 * - Validates that the range is exactly 7 days (6 days difference + inclusive start/end)
 * - Validates that the start date is a Monday (day 1) and end date is a Sunday (day 0)
 * 
 * This validation prevents displaying weekly branch data when:
 * - No date is selected (undefined range)
 * - User is in the middle of selecting a range (only from date set)
 * - A partial week or multiple weeks are selected
 * - The range doesn't start on Monday or end on Sunday
 * 
 * @example
 * ```typescript
 * // Exact week (Monday to Sunday) - returns true
 * const exactWeek = { 
 *   from: new Date('2025-01-13'), // Monday
 *   to: new Date('2025-01-19')    // Sunday
 * };
 * isExactWeekSelected(exactWeek); // true
 * 
 * // Partial week - returns false
 * const partialWeek = { 
 *   from: new Date('2025-01-15'), // Wednesday
 *   to: new Date('2025-01-19')    // Sunday
 * };
 * isExactWeekSelected(partialWeek); // false
 * 
 * // Multiple weeks - returns false
 * const twoWeeks = { 
 *   from: new Date('2025-01-13'), // Monday
 *   to: new Date('2025-01-26')    // Sunday (two weeks later)
 * };
 * isExactWeekSelected(twoWeeks); // false
 * 
 * // No selection - returns false
 * isExactWeekSelected(undefined); // false
 * ```
 */
export function isExactWeekSelected(dateRange?: DateRange): boolean {
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

  // Calculate the difference in days
  const timeDiff = toDate.getTime() - fromDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // Must be exactly 6 days difference (7 days total, inclusive)
  if (daysDiff !== 6) {
    return false;
  }

  // Check if from date is Monday (1) and to date is Sunday (0)
  // Note: getDay() returns 0 for Sunday, 1 for Monday, etc.
  const fromDay = fromDate.getDay();
  const toDay = toDate.getDay();

  return fromDay === 1 && toDay === 0; // Monday to Sunday
}

/**
 * Formats monetary amounts with dollar symbol and standard formatting.
 * This function ensures consistent currency presentation throughout the application
 * with clean, readable formatting without currency prefix.
 * 
 * @param {number} amount - Raw monetary value to format
 * @returns {string} Formatted currency string with dollar symbol only
 * 
 * @description Configuration choices:
 * - Uses standard US locale for number formatting (commas for thousands)
 * - Simple dollar symbol without "USD" prefix for cleaner display
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2, // Always show 2 decimal places
      maximumFractionDigits: 2, // Never exceed 2 decimal places
      currencyDisplay: 'symbol' // Show only $ symbol, not USD
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
 * Sample branch sales data for development and demonstration purposes.
 * 
 * This dataset represents realistic branch performance metrics derived from
 * actual business requirements and UI mockups. It includes various scenarios
 * to test component behavior with different data patterns.
 * 
 * @constant {BranchSalesData[]} DUMMY_BRANCHES_DATA
 * 
 * @description Data characteristics:
 * - Mixed performance scenarios (high/low sales, positive/negative growth)
 * - Realistic monetary values in USD currency
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
 * <WeeklySalesBranches 
 *   selectedDateRange={dateRange}
 *   branches={DUMMY_BRANCHES_DATA} // Explicit usage
 * />
 * 
 * // Automatic fallback (default parameter)
 * <WeeklySalesBranches selectedDateRange={dateRange} />
 * ```
 * 
 * @see {@link BranchSalesData} for interface structure
 */
export const DUMMY_BRANCHES_DATA: BranchSalesData[] = [
  {
    id: '5',
    name: 'Lázaro y Diego',
    location: 'Metropolitan', // Full location example
    totalSales: 74326.60,
    percentage: 22.5, // Positive growth
    openAccounts: 6490.60, // Has pending transactions
    closedSales: 67836.00,
    averageTicket: 369.78, // Realistic ticket average
    totalTickets: 100, // Complete ticket data
    avatar: 'L'
  },
  {
    id: '31',
    name: 'Animal',
    location: 'St Regis', // Different location format
    totalSales: 62432.00,
    percentage: 75.6, // High positive growth
    openAccounts: 0, // All sales completed
    closedSales: 62432.00,
    averageTicket: 0, // Missing average data
    totalTickets: 0, // Missing ticket count
    avatar: 'A'
  },
  {
    id: '26',
    name: 'Animal', // Same brand, different location
    location: 'CDMX',
    totalSales: 48035.00,
    percentage: 65.5, // High positive growth
    openAccounts: 0,
    closedSales: 48035.00,
    averageTicket: 0, // Incomplete data scenario
    totalTickets: 0,
    avatar: 'A'
  },
  {
    id: '38',
    name: 'Mercado Reforma',
    location: '', // Empty location example
    totalSales: 40752.30,
    percentage: 21.6, // Moderate positive growth
    openAccounts: 0,
    closedSales: 40752.30,
    averageTicket: 0, // Testing zero values
    totalTickets: 0,
    avatar: 'M'
  }
];