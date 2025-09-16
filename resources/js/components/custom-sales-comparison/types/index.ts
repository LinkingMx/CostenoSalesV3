import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents sales data for a custom date range within a custom comparison.
 * Contains the date and sales amount information for custom range comparison.
 * This is the core data structure used throughout the custom sales component.
 *
 * @interface SalesCustomData
 * @property {Date} date - The specific date for this sales record within the custom range
 * @property {number} amount - Sales amount for this date in Mexican pesos
 * @property {boolean} isInRange - Whether this date falls within the selected custom range
 * @property {string} dayName - Spanish day name (e.g., "Lunes", "Martes", "Miércoles")
 * @property {string} formattedDate - Formatted date string for display (e.g., "15 Sep")
 *
 * @example
 * const salesData: SalesCustomData = {
 *   date: new Date('2025-09-15'),
 *   amount: 45250.75,
 *   isInRange: true,
 *   dayName: 'Domingo',
 *   formattedDate: '15 Sep'
 * };
 */
export interface SalesCustomData {
    date: Date;
    amount: number;
    isInRange: boolean;
    dayName: string;
    formattedDate: string;
}

/**
 * Props for the CustomSalesComparison component.
 * Controls the display and behavior of the custom date range sales comparison.
 * The component only renders when selectedDateRange contains a valid custom range
 * (not a single day, complete week, or complete month).
 *
 * @interface CustomSalesComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from calendar filter (must be custom range)
 * @property {SalesCustomData[]} [salesData] - Optional array of custom range sales records
 *
 * @example
 * <CustomSalesComparison
 *   selectedDateRange={dateRange}
 *   salesData={mockSalesData}
 * />
 */
export interface CustomSalesComparisonProps {
    selectedDateRange: DateRange | undefined;
    salesData?: SalesCustomData[];
}

/**
 * Props for the SalesCustomCard component.
 * Represents aggregated sales information for the entire custom date range.
 *
 * @interface SalesCustomCardProps
 * @property {SalesCustomData[]} data - Sales data array for the custom range
 * @property {DateRange} dateRange - The actual date range being displayed
 * @property {boolean} [isHighlighted] - Whether this card should be visually highlighted
 *
 * @example
 * <SalesCustomCard
 *   data={salesDataArray}
 *   dateRange={selectedRange}
 *   isHighlighted={false}
 * />
 */
export interface SalesCustomCardProps {
    data: SalesCustomData[];
    dateRange: DateRange;
    isHighlighted?: boolean;
}

/**
 * Props for the CustomComparisonHeader component.
 * Contains the title and subtitle information for the custom comparison section.
 *
 * @interface CustomComparisonHeaderProps
 * @property {string} [title] - Main title text
 * @property {string} [subtitle] - Subtitle description text with date range
 * @property {DateRange} [dateRange] - Date range to display in subtitle
 *
 * @example
 * <CustomComparisonHeader
 *   title="Análisis de ventas (Rango personalizado)"
 *   subtitle="Rango personalizado seleccionado"
 *   dateRange={customRange}
 * />
 */
export interface CustomComparisonHeaderProps {
    title?: string;
    subtitle?: string;
    dateRange?: DateRange;
}

/**
 * Aggregated sales metrics for a custom date range.
 * Contains calculated totals and averages for the entire custom period.
 *
 * @interface CustomRangeMetrics
 * @property {number} totalSales - Total sales amount for the entire custom range
 * @property {number} averageDaily - Average daily sales for the range
 * @property {number} totalDays - Total number of days in the custom range
 * @property {Date} startDate - First date of the range
 * @property {Date} endDate - Last date of the range
 * @property {number} highestDay - Highest single day sales amount
 * @property {number} lowestDay - Lowest single day sales amount
 *
 * @example
 * const metrics: CustomRangeMetrics = {
 *   totalSales: 892456.50,
 *   averageDaily: 44622.83,
 *   totalDays: 20,
 *   startDate: new Date('2025-09-01'),
 *   endDate: new Date('2025-09-20'),
 *   highestDay: 67890.25,
 *   lowestDay: 23456.78
 * };
 */
export interface CustomRangeMetrics {
    totalSales: number;
    averageDaily: number;
    totalDays: number;
    startDate: Date;
    endDate: Date;
    highestDay: number;
    lowestDay: number;
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
 *   errors: ['Invalid custom range', 'Range too large (max 365 days)'],
 *   warnings: ['Range spans multiple months'],
 *   metadata: { validatedAt: new Date(), source: 'custom-sales-data' }
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
        rangeDays?: number;
    };
}

/**
 * Return type for the useCustomSalesComparison hook
 * @interface UseCustomSalesComparisonReturn
 * @property {SalesCustomData[]} customSalesData - Array of custom sales data
 * @property {boolean} isLoading - Loading state
 * @property {string | undefined} error - Error message if any
 * @property {boolean} isValidCustomRange - Whether the selected range is a valid custom range
 * @property {() => void} refetch - Function to refetch data
 */
export interface UseCustomSalesComparisonReturn {
    customSalesData: SalesCustomData[];
    isLoading: boolean;
    error: string | undefined;
    isValidCustomRange: boolean;
    refetch: () => void;
}
