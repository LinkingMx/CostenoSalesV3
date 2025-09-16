import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents sales data for a single month within a monthly comparison.
 * Contains the date and sales amount information for monthly comparison.
 * This is the core data structure used throughout the monthly sales component.
 *
 * @interface SalesMonthData
 * @property {Date} date - The specific date for this sales record (must be a month)
 * @property {number} amount - Sales amount for this month in Mexican pesos
 * @property {boolean} isCurrentMonth - Whether this date falls within the current calendar month
 * @property {string} monthName - Full Spanish month name (e.g., "Enero", "Febrero", "Marzo")
 *
 * @example
 * const salesData: SalesMonthData = {
 *   date: new Date('2025-09-01'),
 *   amount: 250533.98,
 *   isCurrentMonth: true,
 *   monthName: 'Septiembre'
 * };
 */
export interface SalesMonthData {
    date: Date;
    amount: number;
    isCurrentMonth: boolean;
    monthName: string;
}

/**
 * Represents summary data for a single month in monthly sales comparison.
 * Contains total amount and formatted labels for display in cards.
 *
 * @interface MonthlySummaryData
 * @property {number} totalAmount - Total sales amount for the month
 * @property {string} monthNameWithYear - Full month name with year (e.g., "Julio 2025")
 * @property {string} monthLabel - API label identifier ('actual', 'last', 'two_last')
 *
 * @example
 * const summaryData: MonthlySummaryData = {
 *   totalAmount: 228086400.35,
 *   monthNameWithYear: 'Julio 2025',
 *   monthLabel: 'two_last'
 * };
 */
export interface MonthlySummaryData {
    totalAmount: number;
    monthNameWithYear: string;
    monthLabel: string;
}

/**
 * Props for the MonthlySalesComparison component.
 * Controls the display and behavior of the monthly sales comparison.
 * The component only renders when selectedDateRange contains a valid complete month.
 *
 * @interface MonthlySalesComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from calendar filter (must contain complete month)
 *
 * @example
 * <MonthlySalesComparison
 *   selectedDateRange={dateRange}
 * />
 */
export interface MonthlySalesComparisonProps {
    selectedDateRange: DateRange | undefined;
}

/**
 * Props for the SalesMonthCard component.
 * Represents a single month's sales information in a monthly card format.
 *
 * @interface SalesMonthCardProps
 * @property {SalesMonthData} data - Sales data for this specific month
 * @property {boolean} [isHighlighted] - Whether this card should be visually highlighted
 *
 * @example
 * <SalesMonthCard
 *   data={salesData}
 *   isHighlighted={data.isCurrentMonth}
 * />
 */
export interface SalesMonthCardProps {
    data: SalesMonthData;
    isHighlighted?: boolean;
}

/**
 * Props for the MonthlyComparisonHeader component.
 * Contains the title and subtitle information for the monthly comparison section.
 *
 * @interface MonthlyComparisonHeaderProps
 * @property {string} [title] - Main title text
 * @property {string} [subtitle] - Subtitle description text
 *
 * @example
 * <MonthlyComparisonHeader
 *   title="Análisis de ventas (Mensuales)"
 *   subtitle="Mes completo seleccionado"
 * />
 */
export interface MonthlyComparisonHeaderProps {
    title?: string;
    subtitle?: string;
}

/**
 * Validation result interface for runtime data validation.
 * Provides detailed feedback on data integrity and validation errors.
 * Used by validation functions to return comprehensive validation status.
 *
 * @interface ValidationResult
 * @property {boolean} isValid - Whether the data passed all critical validation checks
 * @property {string[]} errors - Array of critical validation error messages that prevent usage
 * @property {string[]} warnings - Array of non-critical validation warnings (data still usable)
 * @property {object} metadata - Additional validation context and debugging information
 *
 * @example
 * ```tsx
 * const result: ValidationResult = {
 *   isValid: false,
 *   errors: ['Invalid date format', 'Amount must be positive'],
 *   warnings: ['Date is in the future'],
 *   metadata: { validatedAt: new Date(), source: 'monthly-sales-data' }
 * };
 * ```
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata: {
        validatedAt: Date;
        source: string;
        itemCount?: number;
    };
}
