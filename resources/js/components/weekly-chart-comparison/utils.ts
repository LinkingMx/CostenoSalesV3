import type { DateRange } from '@/components/main-filter-calendar';
import type { 
  ChartDayData, 
  WeeklyChartData, 
  ChartValidationResult, 
  ChartTheme 
} from './types';

/**
 * Checks if the selected date range represents a complete week for chart display.
 * Reuses the same logic as other weekly components for consistency.
 * Returns true when the date range spans exactly 7 consecutive days.
 * 
 * @function isCompleteWeekSelected
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one complete week is selected, false otherwise
 * 
 * @example
 * const completeWeek = { from: monday, to: sunday };     // Monday-Sunday (7 days)
 * const partialWeek = { from: tuesday, to: friday };     // Only 4 days
 * const twoWeeks = { from: monday1, to: sunday2 };       // Two weeks
 * 
 * isCompleteWeekSelected(completeWeek); // true
 * isCompleteWeekSelected(partialWeek);  // false
 * isCompleteWeekSelected(twoWeeks);     // false
 * isCompleteWeekSelected(undefined);    // false
 */
export function isCompleteWeekSelected(dateRange: DateRange | undefined): boolean {
  if (!dateRange?.from || !dateRange?.to) {
    return false;
  }
  
  const fromDay = dateRange.from.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const toDay = dateRange.to.getDay();
  
  // Calculate the difference in days
  const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Must be exactly 6 days difference (7 days = 6 day difference)
  if (daysDiff !== 6) {
    return false;
  }
  
  // Accept two week formats:
  // 1. Monday to Sunday: fromDay === 1 (Monday) AND toDay === 0 (Sunday)
  // 2. Sunday to Saturday: fromDay === 0 (Sunday) AND toDay === 6 (Saturday)
  return (fromDay === 1 && toDay === 0) || (fromDay === 0 && toDay === 6);
}

/**
 * Gets the Spanish day names in short format for chart x-axis labels.
 * Returns abbreviated day names suitable for chart display with better clarity.
 * 
 * @function getSpanishDayNames
 * @returns {string[]} Array of 7 abbreviated Spanish day names
 * 
 * @example
 * const dayNames = getSpanishDayNames();
 * // Returns: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
 */
export function getSpanishDayNames(): string[] {
  return ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
}

/**
 * Gets the full Spanish day names for tooltips and accessibility.
 * Returns full day names for enhanced user experience.
 * 
 * @function getFullSpanishDayNames
 * @returns {string[]} Array of 7 full Spanish day names
 * 
 * @example
 * const fullDayNames = getFullSpanishDayNames();
 * // Returns: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
 */
export function getFullSpanishDayNames(): string[] {
  return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
}

/**
 * Formats a sales amount as a Mexican peso currency string.
 * Uses the same formatting as other components for consistency.
 * Provides abbreviated format for chart display (e.g., "15.2M").
 * 
 * @function formatChartAmount
 * @param {number} amount - The sales amount to format
 * @param {boolean} [abbreviated] - Whether to use abbreviated format (default: false)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatChartAmount(1500000);      // "$1,500,000.00"
 * formatChartAmount(1500000, true); // "$1.5M"
 * formatChartAmount(850000, true);  // "$850K"
 */
export function formatChartAmount(amount: number, abbreviated: boolean = false): string {
  if (abbreviated) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('MXN', '$').trim();
}

/**
 * Generates realistic sales amounts with weekly business pattern variation.
 * Creates amounts that follow typical Mexican business sales patterns.
 * Different patterns for each day of the week with realistic fluctuations.
 * 
 * @function generateRealisticWeeklySalesAmount
 * @param {number} dayIndex - Day index (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
 * @param {number} weekOffset - Week offset for variation (0, 1, or 2)
 * @returns {number} Realistic sales amount with weekly and day variation
 * 
 * @example
 * const mondayWeek1 = generateRealisticWeeklySalesAmount(0, 0); // Monday, Week 1
 * const fridayWeek2 = generateRealisticWeeklySalesAmount(4, 1);  // Friday, Week 2
 */
function generateRealisticWeeklySalesAmount(dayIndex: number, weekOffset: number): number {
  const baseAmount = 15000000; // Base amount of $15M MXN for weekdays
  
  // Apply realistic business patterns based on day of the week
  // Monday = 0, Tuesday = 1, ..., Sunday = 6
  let dayFactor = 1;
  switch (dayIndex) {
    case 0: // Monday - slower start (people returning from weekend)
      dayFactor = 0.85; // 15% below baseline
      break;
    case 1: // Tuesday - mid-week pickup (business normalizes)
      dayFactor = 1.1; // 10% above baseline
      break;
    case 2: // Wednesday - peak mid-week (optimal business day)
      dayFactor = 1.2; // 20% above baseline
      break;
    case 3: // Thursday - strong day (pre-weekend preparation)
      dayFactor = 1.15; // 15% above baseline
      break;
    case 4: // Friday - end of week rush (weekend shopping, paydays)
      dayFactor = 1.3; // 30% above baseline (highest)
      break;
    case 5: // Saturday - weekend activity, good but less than Friday
      dayFactor = 1.1; // 10% above baseline
      break;
    case 6: // Sunday - weekend activity, but typically lower than weekdays
      dayFactor = 0.7; // 30% below baseline
      break;
    default:
      dayFactor = 1; // Fallback for unexpected values
  }
  
  // Add week-to-week variation
  const weekFactors = [1.0, 0.95, 1.08]; // Week 1: baseline, Week 2: -5%, Week 3: +8%
  const weekFactor = weekFactors[weekOffset] || 1.0;
  
  // Add some randomness for realism (±15% variation)
  const variation = 0.15;
  const randomFactor = (Math.random() - 0.5) * 2 * variation + 1;
  
  return Math.round(baseAmount * dayFactor * weekFactor * randomFactor * 100) / 100;
}

/**
 * Generates mock weekly chart data for development and testing purposes.
 * Creates realistic sales data for 3 weeks across all 7 days.
 * Follows established business patterns and includes proper Spanish localization.
 * 
 * @function generateMockWeeklyChartData
 * @returns {WeeklyChartData} Complete mock data for the 3-week comparison chart
 * 
 * @example
 * const mockData = generateMockWeeklyChartData();
 * // Returns structured data with:
 * // - 7 days of sales data for 3 weeks
 * // - Proper Spanish day names
 * // - Realistic business pattern variations
 * // - Consistent color scheme
 */
export function generateMockWeeklyChartData(): WeeklyChartData {
  const shortDayNames = getSpanishDayNames();
  const fullDayNames = getFullSpanishDayNames();
  
  const dailyData: ChartDayData[] = shortDayNames.map((dayName, index) => ({
    dayName,
    fullDayName: fullDayNames[index],
    week1: generateRealisticWeeklySalesAmount(index, 0),
    week2: generateRealisticWeeklySalesAmount(index, 1),
    week3: generateRealisticWeeklySalesAmount(index, 2),
  }));
  
  return {
    dailyData,
    weekLabels: ['Semana 1', 'Semana 2', 'Semana 3'],
    weekColors: ['#897053', '#6b5d4a', '#4a3d2f'] // Primary theme colors
  };
}

/**
 * Validates weekly chart data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 * Ensures data is suitable for chart rendering and user display.
 * 
 * @function validateWeeklyChartData
 * @param {WeeklyChartData} chartData - Chart data to validate
 * @returns {ChartValidationResult} Detailed validation result with errors and warnings
 * 
 * @example
 * const data = generateMockWeeklyChartData();
 * const result = validateWeeklyChartData(data);
 * if (!result.isValid) {
 *   console.error('Chart validation failed:', result.errors);
 * }
 */
export function validateWeeklyChartData(chartData: WeeklyChartData): ChartValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();
  
  // Check for null or undefined data
  if (!chartData) {
    errors.push('Chart data is required');
    return {
      isValid: false,
      errors,
      warnings,
      metadata: {
        validatedAt: now,
        source: 'weekly-chart-data-validation',
        dayCount: 0,
        weekCount: 0
      }
    };
  }
  
  // Validate dailyData array
  if (!chartData.dailyData || !Array.isArray(chartData.dailyData)) {
    errors.push('Daily data must be an array');
  } else {
    // Should have exactly 7 days
    if (chartData.dailyData.length !== 7) {
      errors.push(`Daily data should contain exactly 7 days, found ${chartData.dailyData.length}`);
    }
    
    // Validate each day's data
    chartData.dailyData.forEach((dayData, index) => {
      const expectedDayName = getSpanishDayNames()[index];
      
      // Validate dayName
      if (!dayData.dayName || typeof dayData.dayName !== 'string') {
        errors.push(`Day ${index + 1}: dayName must be a non-empty string`);
      } else if (dayData.dayName !== expectedDayName) {
        warnings.push(`Day ${index + 1}: expected dayName '${expectedDayName}', got '${dayData.dayName}'`);
      }
      
      // Validate fullDayName
      if (!dayData.fullDayName || typeof dayData.fullDayName !== 'string') {
        errors.push(`Day ${index + 1}: fullDayName must be a non-empty string`);
      }
      
      // Validate week amounts
      ['week1', 'week2', 'week3'].forEach((weekKey) => {
        const amount = dayData[weekKey as keyof ChartDayData] as number;
        
        if (typeof amount !== 'number') {
          errors.push(`Day ${index + 1}, ${weekKey}: amount must be a number`);
        } else if (isNaN(amount)) {
          errors.push(`Day ${index + 1}, ${weekKey}: amount is NaN`);
        } else if (amount < 0) {
          errors.push(`Day ${index + 1}, ${weekKey}: amount cannot be negative`);
        } else if (amount === 0) {
          warnings.push(`Day ${index + 1}, ${weekKey}: amount is zero`);
        } else if (amount > 100000000) {
          warnings.push(`Day ${index + 1}, ${weekKey}: amount seems unusually high (>${formatChartAmount(100000000)})`);
        }
      });
    });
  }
  
  // Validate weekLabels
  if (!chartData.weekLabels || !Array.isArray(chartData.weekLabels)) {
    errors.push('Week labels must be an array');
  } else if (chartData.weekLabels.length !== 3) {
    errors.push(`Week labels should contain exactly 3 items, found ${chartData.weekLabels.length}`);
  } else {
    chartData.weekLabels.forEach((label, index) => {
      if (!label || typeof label !== 'string') {
        errors.push(`Week label ${index + 1}: must be a non-empty string`);
      }
    });
  }
  
  // Validate weekColors
  if (!chartData.weekColors || !Array.isArray(chartData.weekColors)) {
    errors.push('Week colors must be an array');
  } else if (chartData.weekColors.length !== 3) {
    errors.push(`Week colors should contain exactly 3 items, found ${chartData.weekColors.length}`);
  } else {
    chartData.weekColors.forEach((color, index) => {
      if (!color || typeof color !== 'string') {
        errors.push(`Week color ${index + 1}: must be a non-empty string`);
      } else if (!color.match(/^#[0-9A-Fa-f]{6}$/)) {
        warnings.push(`Week color ${index + 1}: '${color}' may not be a valid hex color`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'weekly-chart-data-validation',
      dayCount: chartData.dailyData?.length || 0,
      weekCount: chartData.weekLabels?.length || 0
    }
  };
}

/**
 * Gets the default chart theme matching the application's design system.
 * Provides consistent colors and styling that integrates with shadcn/ui and TailwindCSS.
 * Adapts to light/dark mode with proper contrast ratios.
 * 
 * @function getDefaultChartTheme
 * @returns {ChartTheme} Theme configuration for the chart
 * 
 * @example
 * const theme = getDefaultChartTheme();
 * // Use theme.weekColors for chart line colors
 * // Use theme.primaryColor for highlights
 */
export function getDefaultChartTheme(): ChartTheme {
  // Detect if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');
  
  return {
    primaryColor: '#897053', // Primary theme color
    weekColors: ['#897053', '#6b5d4a', '#4a3d2f'], // Gradient of primary colors
    gridColor: isDarkMode ? '#3F3F3F' : '#D1D5DB', // More visible grid - matches border colors
    textColor: isDarkMode ? '#E0E0E0' : '#5A5A5A', // Matches theme foreground colors
    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F8F8' // Matches theme background
  };
}

/**
 * Validates date range for complete week selection requirements.
 * Ensures the date range meets the weekly chart component's display requirements.
 * 
 * @function validateChartDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ChartValidationResult} Validation result with specific date range errors
 * 
 * @example
 * const range = { from: monday, to: sunday };
 * const result = validateChartDateRange(range);
 * if (result.isValid) {
 *   // Safe to display weekly chart comparison
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
    
    // Validate complete week requirement
    if (dateRange.from && dateRange.to && 
        dateRange.from instanceof Date && dateRange.to instanceof Date) {
      
      if (!isCompleteWeekSelected(dateRange)) {
        errors.push('Date range must represent exactly one complete week (7 consecutive days) for weekly chart comparison');
      }
      
      if (dateRange.from > now) {
        warnings.push('Selected week is in the future');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'chart-date-range-validation'
    }
  };
}