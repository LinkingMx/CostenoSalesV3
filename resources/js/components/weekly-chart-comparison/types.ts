import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents sales data for a single day across 3 weeks for chart comparison.
 * Contains daily sales data to enable week-over-week analysis in chart format.
 * This is the core data structure used for the weekly chart comparison visualization.
 *
 * @interface ChartDayData
 * @property {string} dayName - Spanish day name abbreviation (e.g., "Lun", "Mar", "Mié")
 * @property {number} week1 - Sales amount for this day in week 1 (Mexican pesos)
 * @property {number} week2 - Sales amount for this day in week 2 (Mexican pesos)
 * @property {number} week3 - Sales amount for this day in week 3 (Mexican pesos)
 * @property {string} fullDayName - Full Spanish day name (e.g., "Lunes", "Martes", "Miércoles")
 *
 * @example
 * const mondayData: ChartDayData = {
 *   dayName: 'Lun',
 *   week1: 120000,
 *   week2: 115000,
 *   week3: 138000,
 *   fullDayName: 'Lunes'
 * };
 */
export interface ChartDayData {
    dayName: string;
    week1: number;
    week2: number;
    week3: number;
    fullDayName: string;
}

/**
 * Configuration for the 3-week comparison dataset.
 * Defines the complete data structure for weekly chart comparison.
 *
 * @interface WeeklyChartData
 * @property {ChartDayData[]} dailyData - Array of 7 days (Monday to Sunday) with sales for 3 weeks
 * @property {string[]} weekLabels - Labels for the 3 weeks being compared
 * @property {string[]} weekColors - Color codes for each week line in the chart
 *
 * @example
 * const chartData: WeeklyChartData = {
 *   dailyData: [mondayData, tuesdayData, ...],
 *   weekLabels: ['Semana 1', 'Semana 2', 'Semana 3'],
 *   weekColors: ['#897053', '#6b5d4a', '#4a3d2f']
 * };
 */
export interface WeeklyChartData {
    dailyData: ChartDayData[];
    weekLabels: string[];
    weekColors: string[];
}

/**
 * Props for the WeeklyChartComparison component.
 * Controls the display and behavior of the weekly chart comparison.
 * The component only renders when selectedDateRange contains a valid complete week.
 * Data is provided through the WeeklyChartProvider context.
 *
 * @interface WeeklyChartComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from calendar filter (must contain complete week)
 *
 * @example
 * <WeeklyChartProvider selectedDateRange={dateRange}>
 *   <WeeklyChartComparison selectedDateRange={dateRange} />
 * </WeeklyChartProvider>
 */
export interface WeeklyChartComparisonProps {
    selectedDateRange: DateRange | undefined;
}

/**
 * Props for the WeeklyComparisonChart component.
 * Contains the chart data and display configuration for the Recharts component.
 *
 * @interface WeeklyComparisonChartProps
 * @property {WeeklyChartData} data - Complete chart data including daily sales and week labels
 * @property {number} [height] - Chart height in pixels (default: 300)
 * @property {boolean} [showLegend] - Whether to show the chart legend (default: true)
 * @property {boolean} [showGrid] - Whether to show grid lines (default: true)
 *
 * @example
 * <WeeklyComparisonChart
 *   data={chartData}
 *   height={350}
 *   showLegend={true}
 *   showGrid={true}
 * />
 */
export interface WeeklyComparisonChartProps {
    data: WeeklyChartData;
    height?: number;
    showLegend?: boolean;
    showGrid?: boolean;
}

/**
 * Props for the WeeklyChartHeader component.
 * Contains the title and subtitle information for the weekly chart comparison section.
 *
 * @interface WeeklyChartHeaderProps
 * @property {string} [title] - Main title text (default: "Comparación Semanal")
 * @property {string} [subtitle] - Subtitle description text (default: "Análisis de 3 semanas por día")
 *
 * @example
 * <WeeklyChartHeader
 *   title="Comparación Semanal"
 *   subtitle="Análisis de 3 semanas por día"
 * />
 */
export interface WeeklyChartHeaderProps {
    title?: string;
    subtitle?: string;
}

/**
 * Validation result interface for runtime chart data validation.
 * Provides detailed feedback on chart data integrity and validation errors.
 * Used by validation functions to return comprehensive validation status.
 *
 * @interface ChartValidationResult
 * @property {boolean} isValid - Whether the data passed all critical validation checks
 * @property {string[]} errors - Array of critical validation error messages that prevent chart rendering
 * @property {string[]} warnings - Array of non-critical validation warnings (chart still renderable)
 * @property {object} metadata - Additional validation context and debugging information
 *
 * @example
 * ```tsx
 * const result: ChartValidationResult = {
 *   isValid: false,
 *   errors: ['Invalid day name format', 'Week data must be positive numbers'],
 *   warnings: ['Week 3 has unusually high values'],
 *   metadata: { validatedAt: new Date(), source: 'weekly-chart-data', dayCount: 7 }
 * };
 * ```
 */
export interface ChartValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata: {
        validatedAt: Date;
        source: string;
        dayCount?: number;
        weekCount?: number;
    };
}

/**
 * Chart theme configuration for consistent styling.
 * Defines colors and styling options that integrate with the app's theme system.
 *
 * @interface ChartTheme
 * @property {string} primaryColor - Main chart color matching theme primary (#897053)
 * @property {string[]} weekColors - Array of 3 colors for the week comparison lines
 * @property {string} gridColor - Color for chart grid lines
 * @property {string} textColor - Color for chart text and labels
 * @property {string} backgroundColor - Background color for the chart area
 *
 * @example
 * const theme: ChartTheme = {
 *   primaryColor: '#897053',
 *   weekColors: ['#897053', '#6b5d4a', '#4a3d2f'],
 *   gridColor: '#e5e7eb',
 *   textColor: '#374151',
 *   backgroundColor: '#ffffff'
 * };
 */
export interface ChartTheme {
    primaryColor: string;
    weekColors: string[];
    gridColor: string;
    textColor: string;
    backgroundColor: string;
}
