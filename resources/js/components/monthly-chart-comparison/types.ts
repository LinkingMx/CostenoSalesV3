/**
 * Monthly Chart Comparison Type Definitions
 * Interfaces and types for monthly chart comparison component
 */

import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Data structure for monthly chart showing 3 month totals
 */
export interface MonthlyChartData {
  monthLabels: string[];         // Month labels (e.g., ["Agosto 2025", "Julio 2025", "Junio 2025"])
  monthValues: number[];         // Monthly total values [actual, last, two_last]
  monthColors: string[];         // Colors for each month bar
  legendLabels: string[];        // Legend labels (e.g., ["Mes actual", "Mes anterior", "Hace 2 meses"])
}

/**
 * Props for the main MonthlyChartComparison component
 */
export interface MonthlyChartComparisonProps {
  selectedDateRange: DateRange | undefined;
  className?: string;
}

/**
 * Props for the MonthlyChartHeader component
 */
export interface MonthlyChartHeaderProps {
  title?: string;
  subtitle?: string;
  iconClassName?: string;
}

/**
 * Props for the MonthlyComparisonChart component
 */
export interface MonthlyComparisonChartProps {
  data: MonthlyChartData;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

/**
 * Props for the MonthlyChartSkeleton loading component
 */
export interface MonthlyChartSkeletonProps {
  height?: number;
  className?: string;
}

/**
 * Props for the MonthlyChartError component
 */
export interface MonthlyChartErrorProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

/**
 * Configuration for chart styling
 */
export interface ChartConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  gridColor: string;
  textColor: string;
  backgroundColor: string;
}

/**
 * Validation result for monthly chart data
 */
export interface MonthlyChartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}