/**
 * Constants for the Monthly Chart Comparison component.
 * Centralizes configuration values for better maintainability.
 */

/**
 * Chart display configuration
 */
export const CHART_CONFIG = {
  /** Default chart height in pixels */
  DEFAULT_HEIGHT: 300,

  /** Number of months to display in comparison */
  MONTHS_TO_COMPARE: 3,

  /** Chart margins */
  MARGINS: {
    TOP: 20,
    RIGHT: 30,
    LEFT: 20,
    BOTTOM: 20,
  },

  /** Line and dot styling */
  LINE_WIDTH: 3,
  DOT_RADIUS: 6,
  ACTIVE_DOT_RADIUS: 8,
  DOT_STROKE_WIDTH: 2,

  /** Font sizes */
  AXIS_FONT_SIZE: 12,
  AXIS_FONT_OFFSET: 10,
} as const;

/**
 * Theme colors for the monthly chart
 */
export const CHART_COLORS = {
  /** Primary color for selected month */
  PRIMARY: '#897053',

  /** Color variations for month comparisons (gradient from primary) */
  MONTH_VARIATIONS: ['#897053', '#6b5d4a', '#4a3d2f'],

  /** Light theme colors */
  LIGHT_THEME: {
    GRID: '#D1D5DB',
    TEXT: '#5A5A5A',
    BACKGROUND: '#F8F8F8',
    TOOLTIP_BACKGROUND: '#FFFFFF',
    TOOLTIP_BORDER: '#E5E7EB',
  },

  /** Dark theme colors */
  DARK_THEME: {
    GRID: '#3F3F3F',
    TEXT: '#E0E0E0',
    BACKGROUND: '#1A1A1A',
    TOOLTIP_BACKGROUND: '#2A2A2A',
    TOOLTIP_BORDER: '#4A4A4A',
  },

  /** Common colors */
  DOT_FILL: '#ffffff',
} as const;

/**
 * Realistic monthly sales totals for demo data
 * Based on seasonal business patterns
 */
export const MOCK_MONTHLY_SALES = {
  0: 423456789.12,  // January 2025
  1: 445789123.56,  // February 2025
  2: 478123456.89,  // March 2025
  3: 512456789.23,  // April 2025
  4: 468912345.78,  // May 2025
  5: 495623178.45,  // June 2025
  6: 523789456.12,  // July 2025
  7: 587654123.89,  // August 2025
  8: 614812492.36,  // September 2025
  9: 534567890.12,  // October 2024
  10: 567891234.56, // November 2024
  11: 598734567.89, // December 2024 (holiday season)
} as const;

/**
 * Default fallback values
 */
export const DEFAULTS = {
  /** Default monthly sales amount when month not found */
  DEFAULT_SALES_AMOUNT: 500000000, // 500M

  /** Validation thresholds */
  MAX_REASONABLE_MONTHLY_SALES: 1000000000, // 1B - threshold for warnings
} as const;

/**
 * Spanish month abbreviations for chart display
 */
export const SPANISH_MONTHS = {
  SHORT: {
    0: 'Ene', 1: 'Feb', 2: 'Mar', 3: 'Abr',
    4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Ago',
    8: 'Sept', 9: 'Oct', 10: 'Nov', 11: 'Dic'
  }
} as const;

/**
 * Currency formatting configuration
 */
export const CURRENCY_CONFIG = {
  /** Locale for Mexican peso formatting */
  LOCALE: 'es-MX',

  /** Currency code */
  CURRENCY: 'MXN',

  /** Decimal places for full currency display */
  DECIMAL_PLACES: 2,

  /** Thresholds for abbreviated formatting */
  ABBREVIATION_THRESHOLDS: {
    BILLION: 1000000000,
    MILLION: 1000000,
    THOUSAND: 1000,
  },

  /** Abbreviation suffixes */
  ABBREVIATION_SUFFIXES: {
    BILLION: 'B',
    MILLION: 'M',
    THOUSAND: 'K',
  }
} as const;