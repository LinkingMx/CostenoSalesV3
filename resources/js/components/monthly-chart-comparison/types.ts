import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents a single month's data point in the monthly chart.
 * Contains the month information and total sales amount for chart display.
 *
 * @interface MonthlyDataPoint
 * @property {string} monthLabel - Month label for display (e.g., "Septiembre", "Agosto")
 * @property {string} fullMonthLabel - Full month label with year (e.g., "Septiembre 2025")
 * @property {number} totalSales - Total sales amount for the entire month
 * @property {Date} monthDate - Date representing the first day of the month
 * @property {string} color - Hex color for this month's data point
 *
 * @example
 * const monthData: MonthlyDataPoint = {
 *   monthLabel: 'Septiembre',
 *   fullMonthLabel: 'Septiembre 2025',
 *   totalSales: 614812492.36,
 *   monthDate: new Date('2025-09-01'),
 *   color: '#897053'
 * };
 */
export interface MonthlyDataPoint {
  monthLabel: string;
  fullMonthLabel: string;
  totalSales: number;
  monthDate: Date;
  color: string;
}

/**
 * Configuration for the monthly chart comparison dataset.
 * Contains the 3 monthly data points for chart visualization.
 *
 * @interface MonthlyChartData
 * @property {MonthlyDataPoint[]} monthlyData - Array of 3 monthly sales totals (selected month + 2 previous)
 * @property {Date} selectedMonth - The selected month date (first day of month)
 *
 * @example
 * const chartData: MonthlyChartData = {
 *   monthlyData: [
 *     {
 *       monthLabel: 'Septiembre',
 *       fullMonthLabel: 'Septiembre 2025',
 *       totalSales: 614812492.36,
 *       monthDate: new Date('2025-09-01'),
 *       color: '#897053'
 *     },
 *     {
 *       monthLabel: 'Agosto',
 *       fullMonthLabel: 'Agosto 2025',
 *       totalSales: 587654123.89,
 *       monthDate: new Date('2025-08-01'),
 *       color: '#6b5d4a'
 *     },
 *     {
 *       monthLabel: 'Julio',
 *       fullMonthLabel: 'Julio 2025',
 *       totalSales: 523789456.12,
 *       monthDate: new Date('2025-07-01'),
 *       color: '#4a3d2f'
 *     }
 *   ],
 *   selectedMonth: new Date('2025-09-01')
 * };
 */
export interface MonthlyChartData {
  monthlyData: MonthlyDataPoint[];
  selectedMonth: Date;
}

/**
 * Props for the MonthlyChartComparison component.
 * Controls the display and behavior of the monthly chart comparison.
 * The component only renders when selectedDateRange contains exactly one complete month.
 *
 * @interface MonthlyChartComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from calendar filter (must be complete month)
 * @property {MonthlyChartData} [chartData] - Optional custom chart data (defaults to mock data if not provided)
 *
 * @example
 * <MonthlyChartComparison
 *   selectedDateRange={completeMonthRange}
 *   chartData={customChartData}
 * />
 */
export interface MonthlyChartComparisonProps {
  selectedDateRange: DateRange | undefined;
  chartData?: MonthlyChartData;
}

/**
 * Props for the MonthlyComparisonChart component.
 * Contains the chart data and display configuration for the Recharts line chart component.
 *
 * @interface MonthlyComparisonChartProps
 * @property {MonthlyChartData} data - Complete chart data with 3 monthly totals
 * @property {number} [height] - Chart height in pixels (default: 300)
 * @property {boolean} [showGrid] - Whether to show grid lines (default: true)
 *
 * @example
 * <MonthlyComparisonChart
 *   data={chartData}
 *   height={350}
 *   showGrid={true}
 * />
 */
export interface MonthlyComparisonChartProps {
  data: MonthlyChartData;
  height?: number;
  showGrid?: boolean;
}

/**
 * Props for the MonthlyChartHeader component.
 * Contains the title and subtitle information for the monthly chart comparison section.
 *
 * @interface MonthlyChartHeaderProps
 * @property {string} [title] - Main title text (default: "Gráfica de ventas (Mensuales)")
 * @property {string} [subtitle] - Subtitle description text (default: "Ventas totales de los últimos 3 meses")
 *
 * @example
 * <MonthlyChartHeader
 *   title="Gráfica de ventas (Mensuales)"
 *   subtitle="Ventas totales de los últimos 3 meses"
 * />
 */
export interface MonthlyChartHeaderProps {
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
 *   errors: ['Invalid date format', 'Amount must be positive'],
 *   warnings: ['Amount seems unusually high'],
 *   metadata: { validatedAt: new Date(), source: 'monthly-chart-data', dayCount: 31 }
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
    monthCount?: number;
    selectedMonth?: Date;
  };
}

/**
 * Chart theme configuration for consistent styling.
 * Defines colors and styling options that integrate with the app's theme system.
 * Adapts to light/dark mode with proper contrast ratios.
 *
 * @interface MonthlyChartTheme
 * @property {string} primaryColor - Main chart color for selected month (#897053)
 * @property {string[]} monthColors - Array of 3 colors for the month lines
 * @property {string} gridColor - Color for chart grid lines
 * @property {string} textColor - Color for chart text and labels
 * @property {string} backgroundColor - Background color for the chart area
 * @property {string} tooltipBackground - Background color for tooltips
 * @property {string} tooltipBorder - Border color for tooltips
 *
 * @example
 * const theme: MonthlyChartTheme = {
 *   primaryColor: '#897053',
 *   monthColors: ['#897053', '#6b5d4a', '#4a3d2f'],
 *   gridColor: '#e5e7eb',
 *   textColor: '#374151',
 *   backgroundColor: '#ffffff',
 *   tooltipBackground: '#ffffff',
 *   tooltipBorder: '#e5e7eb'
 * };
 */
export interface MonthlyChartTheme {
  primaryColor: string;
  monthColors: string[];
  gridColor: string;
  textColor: string;
  backgroundColor: string;
  tooltipBackground: string;
  tooltipBorder: string;
}

/**
 * Configuration for generating monthly comparison data.
 * Defines the months to compare against the selected month.
 *
 * @interface MonthComparisonConfig
 * @property {string} label - Spanish label for the month
 * @property {number} monthsOffset - Number of months to subtract from selected month
 * @property {string} color - Hex color for this month's line
 * @property {boolean} isSelected - Whether this is the selected month (primary)
 *
 * @example
 * const months: MonthComparisonConfig[] = [
 *   { label: 'Diciembre 2024', monthsOffset: 0, color: '#897053', isSelected: true },
 *   { label: 'Noviembre 2024', monthsOffset: 1, color: '#6b5d4a', isSelected: false },
 *   { label: 'Octubre 2024', monthsOffset: 2, color: '#4a3d2f', isSelected: false }
 * ];
 */
export interface MonthComparisonConfig {
  label: string;
  monthsOffset: number;
  color: string;
  isSelected: boolean;
}