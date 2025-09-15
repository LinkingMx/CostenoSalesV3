import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents sales data for a single day within a work week.
 * Contains the date and sales amount information for weekly comparison.
 * This is the core data structure used throughout the weekly sales component.
 *
 * @interface SalesWeekData
 * @property {Date} date - The specific date for this sales record (must be a weekday)
 * @property {number} amount - Sales amount for this day in Mexican pesos
 * @property {boolean} isCurrentWeek - Whether this date falls within the current calendar week
 * @property {string} dayName - Full Spanish day name (e.g., "Lunes", "Martes", "Miércoles")
 *
 * @example
 * const salesData: SalesWeekData = {
 *   date: new Date('2025-09-11'),
 *   amount: 250533.98,
 *   isCurrentWeek: true,
 *   dayName: 'Jueves'
 * };
 */
export interface SalesWeekData {
  date: Date;
  amount: number;
  isCurrentWeek: boolean;
  dayName: string;
}

/**
 * Represents aggregated sales data for an entire week (7 days).
 * Contains the date range and total sales amount for the week.
 * This is used for displaying 3-week summary cards.
 *
 * @interface WeeklySummaryData
 * @property {Date} startDate - The first date of the week (typically Monday)
 * @property {Date} endDate - The last date of the week (typically Sunday)
 * @property {number} totalAmount - Total sales amount for all 7 days of the week
 * @property {string} dateRangeLabel - Formatted date range (e.g., "25-08 al 31-08-25")
 * @property {string} weekLabel - Week identifier (e.g., "actual", "last", "two_last")
 *
 * @example
 * const weekSummary: WeeklySummaryData = {
 *   startDate: new Date('2025-08-25'),
 *   endDate: new Date('2025-08-31'),
 *   totalAmount: 59522507.81,
 *   dateRangeLabel: "25-08 al 31-08-25",
 *   weekLabel: "actual"
 * };
 */
export interface WeeklySummaryData {
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  dateRangeLabel: string;
  weekLabel: string;
}

/**
 * Props for the WeeklySalesComparison component.
 * Controls the display and behavior of the weekly sales comparison.
 * The component only renders when selectedDateRange contains a complete week (Mon-Sun).
 *
 * @interface WeeklySalesComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from calendar filter (must contain Mon-Sun)
 * @property {WeeklySummaryData[]} [weeklySummaryData] - Optional array of 3 weekly summary records (actual, last, two_last)
 *
 * @example
 * <WeeklySalesComparison
 *   selectedDateRange={dateRange}
 *   weeklySummaryData={weeklyData}
 * />
 */
export interface WeeklySalesComparisonProps {
  selectedDateRange: DateRange | undefined;
  weeklySummaryData?: WeeklySummaryData[];
}

/**
 * Props for the SalesWeekCard component.
 * Represents a single day's sales information in a weekly card format.
 *
 * @interface SalesWeekCardProps
 * @property {SalesWeekData} data - Sales data for this specific day
 * @property {boolean} [isHighlighted] - Whether this card should be visually highlighted
 *
 * @example
 * <SalesWeekCard
 *   data={salesData}
 *   isHighlighted={data.isCurrentWeek}
 * />
 */
export interface SalesWeekCardProps {
  data: SalesWeekData;
  isHighlighted?: boolean;
}

/**
 * Props for the WeeklySummaryCard component.
 * Represents aggregated sales information for an entire week.
 *
 * @interface WeeklySummaryCardProps
 * @property {WeeklySummaryData} data - Weekly summary data including date range and total amount
 *
 * @example
 * <WeeklySummaryCard
 *   data={weeklySummaryData}
 * />
 */
export interface WeeklySummaryCardProps {
  data: WeeklySummaryData;
}

/**
 * Props for the WeeklyComparisonHeader component.
 * Contains the title and subtitle information for the weekly comparison section.
 * 
 * @interface WeeklyComparisonHeaderProps
 * @property {string} [title] - Main title text
 * @property {string} [subtitle] - Subtitle description text
 * 
 * @example
 * <WeeklyComparisonHeader 
 *   title="Ventas semanales"
 *   subtitle="Semana seleccionada (Lunes - Viernes)"
 * />
 */
export interface WeeklyComparisonHeaderProps {
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
 *   metadata: { validatedAt: new Date(), source: 'weekly-sales-data' }
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