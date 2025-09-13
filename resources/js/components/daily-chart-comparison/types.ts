import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Represents a single comparison point in the daily chart.
 * Contains the period label, amount, visual styling, and metadata for chart display.
 * 
 * @interface ChartPoint
 * @property {string} period - Spanish period label ("Hoy", "Ayer", "Hace 1 semana", "Hace 1 mes")
 * @property {number} amount - Sales amount for this period (Mexican pesos)
 * @property {string} color - Hex color code for chart bar visualization
 * @property {Date} date - The actual date this data represents
 * @property {boolean} isSelected - Whether this is the selected day (true for "Hoy")
 * 
 * @example
 * const todayPoint: ChartPoint = {
 *   period: 'Hoy',
 *   amount: 1250000,
 *   color: '#897053',
 *   date: new Date('2025-09-12'),
 *   isSelected: true
 * };
 */
export interface ChartPoint {
  period: string;
  amount: number;
  color: string;
  date: Date;
  isSelected: boolean;
}

/**
 * Configuration for the daily chart comparison dataset.
 * Contains the selected day information and comparison data for chart visualization.
 * 
 * @interface DailyChartData
 * @property {Object} selectedDay - Information about the selected day
 * @property {Date} selectedDay.date - The selected date
 * @property {string} selectedDay.fullDayName - Full Spanish day name with date (e.g., "Lunes, 11 de Diciembre")
 * @property {number} selectedDay.amount - Sales amount for the selected day
 * @property {ChartPoint[]} comparisonData - Array of 4 comparison periods for chart display
 * 
 * @example
 * const chartData: DailyChartData = {
 *   selectedDay: {
 *     date: new Date('2025-09-12'),
 *     fullDayName: 'Jueves, 12 de Septiembre',
 *     amount: 1250000
 *   },
 *   comparisonData: [todayPoint, yesterdayPoint, lastWeekPoint, lastMonthPoint]
 * };
 */
export interface DailyChartData {
  selectedDay: {
    date: Date;
    fullDayName: string;
    amount: number;
  };
  comparisonData: ChartPoint[];
}

/**
 * Props for the DailyChartComparison component.
 * Controls the display and behavior of the daily chart comparison.
 * The component only renders when selectedDateRange contains exactly one day.
 * 
 * @interface DailyChartComparisonProps
 * @property {DateRange | undefined} selectedDateRange - Current date range from calendar filter (must contain single day)
 * @property {DailyChartData} [chartData] - Optional custom chart data (defaults to mock data if not provided)
 * 
 * @example
 * <DailyChartComparison 
 *   selectedDateRange={singleDayRange}
 *   chartData={customChartData}
 * />
 */
export interface DailyChartComparisonProps {
  selectedDateRange: DateRange | undefined;
  chartData?: DailyChartData;
}

/**
 * Props for the DailyComparisonChart component.
 * Contains the chart data and display configuration for the Recharts bar chart component.
 * 
 * @interface DailyComparisonChartProps
 * @property {DailyChartData} data - Complete chart data including selected day and comparison points
 * @property {number} [height] - Chart height in pixels (default: 300)
 * @property {boolean} [showGrid] - Whether to show grid lines (default: true)
 * @property {string} [orientation] - Chart orientation: 'vertical' or 'horizontal' (default: 'vertical')
 * 
 * @example
 * <DailyComparisonChart 
 *   data={chartData}
 *   height={350}
 *   showGrid={true}
 *   orientation="vertical"
 * />
 */
export interface DailyComparisonChartProps {
  data: DailyChartData;
  height?: number;
  showGrid?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Props for the DailyChartHeader component.
 * Contains the title and subtitle information for the daily chart comparison section.
 * 
 * @interface DailyChartHeaderProps
 * @property {string} [title] - Main title text (default: "Comparación Diaria")
 * @property {string} [subtitle] - Subtitle description text (default: "Análisis del día seleccionado")
 * 
 * @example
 * <DailyChartHeader 
 *   title="Comparación Diaria"
 *   subtitle="Análisis del día seleccionado"
 * />
 */
export interface DailyChartHeaderProps {
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
 *   metadata: { validatedAt: new Date(), source: 'daily-chart-data', pointCount: 4 }
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
    pointCount?: number;
    selectedDate?: Date;
  };
}

/**
 * Chart theme configuration for consistent styling.
 * Defines colors and styling options that integrate with the app's theme system.
 * Adapts to light/dark mode with proper contrast ratios.
 * 
 * @interface DailyChartTheme
 * @property {string} primaryColor - Main chart color for selected day (#897053)
 * @property {string[]} comparisonColors - Array of 4 colors for comparison periods
 * @property {string} gridColor - Color for chart grid lines
 * @property {string} textColor - Color for chart text and labels
 * @property {string} backgroundColor - Background color for the chart area
 * @property {string} tooltipBackground - Background color for tooltips
 * @property {string} tooltipBorder - Border color for tooltips
 * 
 * @example
 * const theme: DailyChartTheme = {
 *   primaryColor: '#897053',
 *   comparisonColors: ['#897053', '#6b5d4a', '#8b7355', '#7a6649'],
 *   gridColor: '#e5e7eb',
 *   textColor: '#374151',
 *   backgroundColor: '#ffffff',
 *   tooltipBackground: '#ffffff',
 *   tooltipBorder: '#e5e7eb'
 * };
 */
export interface DailyChartTheme {
  primaryColor: string;
  comparisonColors: string[];
  gridColor: string;
  textColor: string;
  backgroundColor: string;
  tooltipBackground: string;
  tooltipBorder: string;
}

/**
 * Configuration for generating comparison periods.
 * Defines the periods to compare against the selected day.
 * 
 * @interface ComparisonPeriodConfig
 * @property {string} label - Spanish label for the period
 * @property {number} daysOffset - Number of days to subtract from selected date
 * @property {string} color - Hex color for this period
 * @property {boolean} isSelected - Whether this is the selected day (primary)
 * 
 * @example
 * const periods: ComparisonPeriodConfig[] = [
 *   { label: 'Hoy', daysOffset: 0, color: '#897053', isSelected: true },
 *   { label: 'Ayer', daysOffset: 1, color: '#6b5d4a', isSelected: false },
 *   { label: 'Hace 1 semana', daysOffset: 7, color: '#8b7355', isSelected: false },
 *   { label: 'Hace 1 mes', daysOffset: 30, color: '#7a6649', isSelected: false }
 * ];
 */
export interface ComparisonPeriodConfig {
  label: string;
  daysOffset: number;
  color: string;
  isSelected: boolean;
}