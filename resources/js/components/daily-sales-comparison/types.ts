import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents sales data for a single day.
 * Contains the date and sales amount information.
 *
 * @interface SalesDayData
 * @property {Date} date - The date for this sales record
 * @property {number} amount - Sales amount for this day
 * @property {boolean} isToday - Whether this date is today
 *
 * @example
 * const salesData: SalesDayData = {
 *   date: new Date('2025-09-11'),
 *   amount: 250533.98,
 *   isToday: true
 * };
 */
export interface SalesDayData {
    date: Date;
    amount: number;
    isToday: boolean;
}

/**
 * Props for the DailySalesComparison component.
 * Controls the display and behavior of the daily sales comparison.
 *
 * @interface DailySalesComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from the calendar filter
 * @property {SalesDayData[]} [salesData] - Optional array of sales data for each day
 * @property {boolean} [useMockData] - Force use of mock data (for testing/development)
 *
 * @example
 * <DailySalesComparison
 *   selectedDateRange={dateRange}
 *   salesData={mockSalesData}
 *   useMockData={false}
 * />
 */
export interface DailySalesComparisonProps {
    selectedDateRange: DateRange | undefined;
    salesData?: SalesDayData[];
    useMockData?: boolean;
}

/**
 * Props for the SalesDayCard component.
 * Represents a single day's sales information in a card format.
 *
 * @interface SalesDayCardProps
 * @property {SalesDayData} data - Sales data for this specific day
 * @property {boolean} [isHighlighted] - Whether this card should be visually highlighted
 *
 * @example
 * <SalesDayCard
 *   data={salesData}
 *   isHighlighted={data.isToday}
 * />
 */
export interface SalesDayCardProps {
    data: SalesDayData;
    isHighlighted?: boolean;
}

/**
 * Props for the SalesComparisonHeader component.
 * Contains the title and subtitle information for the comparison section.
 *
 * @interface SalesComparisonHeaderProps
 * @property {string} [title] - Main title text
 * @property {string} [subtitle] - Subtitle description text
 *
 * @example
 * <SalesComparisonHeader
 *   title="Análisis de ventas (Diarias)"
 *   subtitle="Día filtrado + 3 días anteriores"
 * />
 */
export interface SalesComparisonHeaderProps {
    title?: string;
    subtitle?: string;
}

/**
 * Validation result interface for runtime data validation.
 * Provides detailed feedback on data integrity and validation errors.
 *
 * @interface ValidationResult
 * @property {boolean} isValid - Whether the data passed all validation checks
 * @property {string[]} errors - Array of validation error messages
 * @property {string[]} warnings - Array of non-critical validation warnings
 * @property {object} metadata - Additional validation metadata
 *
 * @example
 * ```tsx
 * const result: ValidationResult = {
 *   isValid: false,
 *   errors: ['Invalid date format', 'Amount must be positive'],
 *   warnings: ['Date is in the future'],
 *   metadata: { validatedAt: new Date(), source: 'sales-data' }
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
