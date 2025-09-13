import type { DateRange } from '@/components/main-filter-calendar';
import { isCompleteMonthSelected } from '@/lib/date-validation';
import type {
  MonthlyChartData,
  MonthlyDataPoint,
  ChartValidationResult,
  MonthlyChartTheme
} from './types';
import {
  SPANISH_MONTHS,
  CURRENCY_CONFIG,
  MOCK_MONTHLY_SALES,
  DEFAULTS,
  CHART_COLORS
} from './constants';

// Re-export the month validation function for consistency
export { isCompleteMonthSelected };

/**
 * Formats a date to a Spanish month name with year.
 * Returns format like "Diciembre 2024".
 *
 * @function formatMonthLabel
 * @param {Date} date - The date to format
 * @returns {string} Spanish month name with year
 *
 * @example
 * const date = new Date('2024-12-15');
 * formatMonthLabel(date); // "Diciembre 2024"
 */
export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formats a date to a short Spanish month name.
 * Returns format like "Sept", "Ago", "Jul".
 *
 * @function formatMonthShortLabel
 * @param {Date} date - The date to format
 * @returns {string} Short Spanish month name
 *
 * @example
 * const date = new Date('2025-09-01');
 * formatMonthShortLabel(date); // "Sept"
 */
export function formatMonthShortLabel(date: Date): string {
  return SPANISH_MONTHS.SHORT[date.getMonth() as keyof typeof SPANISH_MONTHS.SHORT] || 'N/A';
}

/**
 * Formats a sales amount as a Mexican peso currency string.
 * Uses the same formatting as other components for consistency.
 * Provides abbreviated format for chart display (e.g., "614.8M").
 *
 * @function formatChartAmount
 * @param {number} amount - The sales amount to format
 * @param {boolean} [abbreviated] - Whether to use abbreviated format (default: true)
 * @returns {string} Formatted currency string
 *
 * @example
 * formatChartAmount(614812492.36);      // "$614.8M"
 * formatChartAmount(614812492.36, false); // "$614,812,492.36"
 */
export function formatChartAmount(amount: number, abbreviated: boolean = true): string {
  if (abbreviated) {
    const { ABBREVIATION_THRESHOLDS: thresholds, ABBREVIATION_SUFFIXES: suffixes } = CURRENCY_CONFIG;

    if (amount >= thresholds.BILLION) {
      return `$${(amount / thresholds.BILLION).toFixed(1)}${suffixes.BILLION}`;
    } else if (amount >= thresholds.MILLION) {
      return `$${(amount / thresholds.MILLION).toFixed(1)}${suffixes.MILLION}`;
    } else if (amount >= thresholds.THOUSAND) {
      return `$${(amount / thresholds.THOUSAND).toFixed(0)}${suffixes.THOUSAND}`;
    }
    return `$${amount.toFixed(0)}`;
  }

  return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
    style: 'currency',
    currency: CURRENCY_CONFIG.CURRENCY,
    minimumFractionDigits: CURRENCY_CONFIG.DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_CONFIG.DECIMAL_PLACES
  }).format(amount).replace(CURRENCY_CONFIG.CURRENCY, '$').trim();
}

/**
 * Generates realistic monthly sales totals for development and testing.
 * Includes seasonal patterns and business variations.
 *
 * @function generateRealisticMonthlySales
 * @param {Date} monthDate - The first day of the month to generate sales for
 * @returns {number} Realistic monthly sales total in Mexican pesos
 *
 * @example
 * const september = new Date('2025-09-01');
 * const sales = generateRealisticMonthlySales(september);
 * // Returns realistic monthly total like 614812492.36
 */
function generateRealisticMonthlySales(monthDate: Date): number {
  const month = monthDate.getMonth();
  return MOCK_MONTHLY_SALES[month as keyof typeof MOCK_MONTHLY_SALES] || DEFAULTS.DEFAULT_SALES_AMOUNT;
}

/**
 * Generates mock monthly chart data for development and testing purposes.
 * Creates realistic monthly sales totals for the selected month plus 2 previous months.
 * Returns 3 data points showing total sales for each complete month.
 *
 * @function generateMockMonthlyChartData
 * @param {Date} selectedMonth - The selected month date (first day of month)
 * @returns {MonthlyChartData} Complete chart data with monthly sales totals for 3 months
 *
 * @example
 * const selectedDate = new Date('2025-09-01');
 * const mockData = generateMockMonthlyChartData(selectedDate);
 * // Returns monthly totals for Septiembre 2025, Agosto 2025, Julio 2025
 */
export function generateMockMonthlyChartData(selectedMonth: Date): MonthlyChartData {
  // Normalize to first day of month
  const month1 = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const month2 = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
  const month3 = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 2, 1);

  // Define color scheme with primary color and variations
  const colors = [...CHART_COLORS.MONTH_VARIATIONS];

  // Generate realistic monthly sales totals
  const monthlyData: MonthlyDataPoint[] = [
    {
      monthLabel: formatMonthShortLabel(month1),
      fullMonthLabel: formatMonthLabel(month1),
      totalSales: generateRealisticMonthlySales(month1),
      monthDate: month1,
      color: colors[0]
    },
    {
      monthLabel: formatMonthShortLabel(month2),
      fullMonthLabel: formatMonthLabel(month2),
      totalSales: generateRealisticMonthlySales(month2),
      monthDate: month2,
      color: colors[1]
    },
    {
      monthLabel: formatMonthShortLabel(month3),
      fullMonthLabel: formatMonthLabel(month3),
      totalSales: generateRealisticMonthlySales(month3),
      monthDate: month3,
      color: colors[2]
    }
  ];

  return {
    monthlyData,
    selectedMonth: month1
  };
}

/**
 * Validates monthly chart data for integrity and consistency.
 * Performs comprehensive runtime validation of chart data structure and values.
 * Used in development mode to catch data issues early.
 *
 * @function validateMonthlyChartData
 * @param {MonthlyChartData} data - Chart data to validate
 * @returns {ChartValidationResult} Detailed validation result with errors and warnings
 *
 * @example
 * const validation = validateMonthlyChartData(chartData);
 * if (!validation.isValid) {
 *   console.error('Chart data validation failed:', validation.errors);
 * }
 */
export function validateMonthlyChartData(data: MonthlyChartData): ChartValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();

  // Validate basic structure
  if (!data) {
    return {
      isValid: false,
      errors: ['Chart data is null or undefined'],
      warnings: [],
      metadata: {
        validatedAt: now,
        source: 'monthly-chart-data-validation',
        monthCount: 0
      }
    };
  }

  // Validate monthly data array
  if (!Array.isArray(data.monthlyData) || data.monthlyData.length === 0) {
    errors.push('Monthly data array is empty or not an array');
  } else {
    // Should have exactly the required number of months
    if (data.monthlyData.length !== 3) {
      errors.push(`Monthly data should contain exactly 3 months, found ${data.monthlyData.length}`);
    }

    // Validate each monthly data point
    data.monthlyData.forEach((monthData, index) => {
      if (typeof monthData.monthLabel !== 'string' || monthData.monthLabel.trim() === '') {
        errors.push(`Month ${index + 1}: Invalid month label`);
      }

      if (typeof monthData.fullMonthLabel !== 'string' || monthData.fullMonthLabel.trim() === '') {
        errors.push(`Month ${index + 1}: Invalid full month label`);
      }

      if (typeof monthData.totalSales !== 'number' || monthData.totalSales < 0) {
        errors.push(`Month ${index + 1}: Invalid total sales amount (${monthData.totalSales})`);
      }

      if (monthData.totalSales > DEFAULTS.MAX_REASONABLE_MONTHLY_SALES) {
        warnings.push(`Month ${index + 1}: Total sales amount seems unusually high (${monthData.totalSales})`);
      }

      if (!monthData.monthDate || !(monthData.monthDate instanceof Date)) {
        errors.push(`Month ${index + 1}: Invalid month date`);
      }

      if (typeof monthData.color !== 'string' || !monthData.color.startsWith('#')) {
        errors.push(`Month ${index + 1}: Invalid color format (${monthData.color})`);
      }
    });
  }

  // Validate selected month
  if (!data.selectedMonth || !(data.selectedMonth instanceof Date)) {
    errors.push('Selected month must be a valid Date object');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'monthly-chart-data-validation',
      monthCount: data.monthlyData?.length || 0,
      selectedMonth: data.selectedMonth
    }
  };
}

/**
 * Gets the default chart theme matching the application's design system.
 * Provides consistent colors and styling that integrates with shadcn/ui and TailwindCSS.
 * Adapts to light/dark mode with proper contrast ratios.
 *
 * @function getDefaultMonthlyChartTheme
 * @returns {MonthlyChartTheme} Theme configuration for the monthly chart
 *
 * @example
 * const theme = getDefaultMonthlyChartTheme();
 * // Use theme.monthColors for chart line colors
 * // Use theme.primaryColor for highlights
 */
export function getDefaultMonthlyChartTheme(): MonthlyChartTheme {
  // Detect if dark mode is active
  const isDarkMode = typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const colors = isDarkMode ? CHART_COLORS.DARK_THEME : CHART_COLORS.LIGHT_THEME;

  return {
    primaryColor: CHART_COLORS.PRIMARY,
    monthColors: [...CHART_COLORS.MONTH_VARIATIONS],
    gridColor: colors.GRID,
    textColor: colors.TEXT,
    backgroundColor: colors.BACKGROUND,
    tooltipBackground: colors.TOOLTIP_BACKGROUND,
    tooltipBorder: colors.TOOLTIP_BORDER
  };
}

/**
 * Validates date range for complete month selection requirements.
 * Ensures the date range meets the monthly chart component's display requirements.
 *
 * @function validateChartDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ChartValidationResult} Validation result with specific date range errors
 *
 * @example
 * const range = { from: new Date('2024-12-01'), to: new Date('2024-12-31') };
 * const result = validateChartDateRange(range);
 * if (result.isValid) {
 *   // Safe to display monthly chart comparison
 * }
 */
export function validateChartDateRange(dateRange: DateRange | undefined): ChartValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();

  if (!dateRange) {
    errors.push('Date range is required for chart display');
  } else {
    if (!dateRange.from) {
      errors.push('Start date (from) is required');
    } else if (!(dateRange.from instanceof Date)) {
      errors.push('Start date must be a Date object');
    } else if (isNaN(dateRange.from.getTime())) {
      errors.push('Start date is invalid');
    }

    if (!dateRange.to) {
      errors.push('End date (to) is required');
    } else if (!(dateRange.to instanceof Date)) {
      errors.push('End date must be a Date object');
    } else if (isNaN(dateRange.to.getTime())) {
      errors.push('End date is invalid');
    }

    // Validate complete month requirement
    if (dateRange.from && dateRange.to &&
        dateRange.from instanceof Date && dateRange.to instanceof Date) {

      if (!isCompleteMonthSelected(dateRange)) {
        errors.push('Date range must represent exactly one complete month (first to last day) for monthly chart comparison');
      }

      if (dateRange.from > now) {
        warnings.push('Selected month is in the future');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'chart-date-range-validation',
      selectedMonth: dateRange?.from
    }
  };
}