import type { DateRange } from '@/components/main-filter-calendar';
import type {
  DailyChartData,
  ChartPoint,
  ChartValidationResult,
  DailyChartTheme,
  ComparisonPeriodConfig
} from './types';
import type { ProcessedChartData, ProcessedDayData } from '@/lib/services/types';
import { parseLocalDate } from '@/lib/services/hours-chart.service';

/**
 * Checks if the selected date range represents exactly one day for chart display.
 * Reuses the same logic as other daily components for consistency.
 * Returns true when the date range represents a single day selection.
 * 
 * @function isSingleDaySelected
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one day is selected, false otherwise
 * 
 * @example
 * const singleDay = { from: new Date('2025-09-12'), to: new Date('2025-09-12') };
 * const range = { from: new Date('2025-09-12'), to: new Date('2025-09-15') };
 * 
 * isSingleDaySelected(singleDay); // true
 * isSingleDaySelected(range);     // false
 * isSingleDaySelected(undefined); // false
 */
export function isSingleDaySelected(dateRange: DateRange | undefined): boolean {
  if (!dateRange?.from) {
    return false;
  }

  // If 'to' is not provided, assume it's a single day selection
  if (!dateRange.to) {
    return true;
  }

  // Compare dates without time (normalize to start of day)
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);

  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  return fromDate.getTime() === toDate.getTime();
}

/**
 * Formats a date to a full Spanish day name with date.
 * Returns format like "Lunes, 12 de Septiembre".
 * 
 * @function formatFullDayName
 * @param {Date} date - The date to format
 * @returns {string} Full Spanish day name with date
 * 
 * @example
 * const date = new Date('2025-09-12');
 * formatFullDayName(date); // "Jueves, 12 de Septiembre"
 */
export function formatFullDayName(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

/**
 * Formats a sales amount as a Mexican peso currency string.
 * Uses the same formatting as other components for consistency.
 * Provides abbreviated format for chart display (e.g., "1.5M").
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
 * Gets the default comparison period configuration.
 * Defines the 4 periods for daily comparison: Today, Yesterday, Last Week, Last Month.
 * 
 * @function getComparisonPeriods
 * @returns {ComparisonPeriodConfig[]} Array of comparison period configurations
 * 
 * @example
 * const periods = getComparisonPeriods();
 * // Returns configuration for Hoy, Ayer, Hace 1 semana, Hace 1 mes
 */
export function getComparisonPeriods(): ComparisonPeriodConfig[] {
  return [
    {
      label: 'Hoy',
      daysOffset: 0,
      color: '#897053', // Primary color for selected day
      isSelected: true
    },
    {
      label: 'Ayer',
      daysOffset: 1,
      color: '#6b5d4a', // Secondary color
      isSelected: false
    },
    {
      label: 'Hace 1 semana',
      daysOffset: 7,
      color: '#8b7355', // Tertiary color
      isSelected: false
    },
    {
      label: 'Hace 1 mes',
      daysOffset: 30,
      color: '#7a6649', // Quaternary color
      isSelected: false
    }
  ];
}

/**
 * Generates realistic sales amounts with business pattern variation.
 * Creates amounts that follow typical Mexican business sales patterns.
 * Includes daily variation, weekly patterns, and seasonal trends.
 * 
 * @function generateRealisticDailySalesAmount
 * @param {Date} date - The date to generate sales for
 * @param {number} daysOffset - Days offset for comparison periods
 * @returns {number} Realistic sales amount with business pattern variation
 * 
 * @example
 * const today = new Date('2025-09-12');
 * const todayAmount = generateRealisticDailySalesAmount(today, 0); // Today
 * const yesterdayAmount = generateRealisticDailySalesAmount(today, 1); // Yesterday
 */
function generateRealisticDailySalesAmount(date: Date, daysOffset: number): number {
  const baseAmount = 12000000; // Base amount of $12M MXN for selected day
  
  // Get the actual date for the period
  const periodDate = new Date(date);
  periodDate.setDate(date.getDate() - daysOffset);
  
  // Apply day-of-week business patterns
  const dayOfWeek = periodDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let dayFactor = 1;
  
  switch (dayOfWeek) {
    case 0: // Sunday - lowest sales (many businesses closed or reduced hours)
      dayFactor = 0.6; // 40% below baseline
      break;
    case 1: // Monday - slow start to the week
      dayFactor = 0.8; // 20% below baseline
      break;
    case 2: // Tuesday - business picking up
      dayFactor = 1.0; // Baseline
      break;
    case 3: // Wednesday - mid-week peak
      dayFactor = 1.15; // 15% above baseline
      break;
    case 4: // Thursday - strong business day
      dayFactor = 1.2; // 20% above baseline
      break;
    case 5: // Friday - highest sales (payday, weekend preparation)
      dayFactor = 1.35; // 35% above baseline
      break;
    case 6: // Saturday - good weekend activity
      dayFactor = 1.1; // 10% above baseline
      break;
    default:
      dayFactor = 1;
  }
  
  // Apply comparison period variation
  let periodFactor = 1;
  switch (daysOffset) {
    case 0: // Today (selected day) - baseline
      periodFactor = 1.0;
      break;
    case 1: // Yesterday - slight variation
      periodFactor = 0.95 + (Math.random() * 0.1); // -5% to +5%
      break;
    case 7: // Last week same day - weekly variation
      periodFactor = 0.9 + (Math.random() * 0.2); // -10% to +10%
      break;
    case 30: // Last month same day - monthly trend
      periodFactor = 0.85 + (Math.random() * 0.3); // -15% to +15%
      break;
    default:
      periodFactor = 1;
  }
  
  // Add seasonal variation (simplified - based on month)
  const month = periodDate.getMonth(); // 0 = January, 11 = December
  let seasonalFactor = 1;
  
  // Mexican business seasonality patterns
  if (month >= 10 || month <= 1) { // Nov, Dec, Jan, Feb - holiday season
    seasonalFactor = 1.2; // 20% increase
  } else if (month >= 6 && month <= 8) { // Jul, Aug, Sep - summer vacation
    seasonalFactor = 0.9; // 10% decrease
  } else if (month >= 2 && month <= 4) { // Mar, Apr, May - spring growth
    seasonalFactor = 1.1; // 10% increase
  }
  
  // Add small random variation for realism (±5%)
  const randomVariation = 0.05;
  const randomFactor = (Math.random() - 0.5) * 2 * randomVariation + 1;
  
  return Math.round(baseAmount * dayFactor * periodFactor * seasonalFactor * randomFactor * 100) / 100;
}

/**
 * Generates mock daily chart data using the same logic as daily-sales-comparison.
 * Uses the selected date + 3 previous consecutive days for comparison data.
 * This ensures consistency with the daily-sales-comparison component.
 * 
 * @function generateMockDailyChartData
 * @param {Date} selectedDate - The selected date to generate comparison data for
 * @returns {DailyChartData} Complete mock data for the daily chart comparison
 * 
 * @example
 * const selectedDate = new Date('2025-09-12');
 * const mockData = generateMockDailyChartData(selectedDate);
 * // Returns the same 4 days as daily-sales-comparison
 */
export function generateMockDailyChartData(selectedDate: Date): DailyChartData {
  // Generate the same 4 dates as daily-sales-comparison (selected date + 3 previous consecutive days)
  const datesToShow: Date[] = [];
  for (let i = 0; i < 4; i++) {
    const day = new Date(selectedDate);
    day.setDate(selectedDate.getDate() - i);
    datesToShow.push(day);
  }
  
  // Generate mock sales data for these dates (same logic as daily-sales-comparison)
  const today = new Date();
  const todayDateString = today.toDateString();
  const mockAmounts = [250533.98, 7068720.45, 8166555.62, 8064541.02];
  
  const mockSalesData = datesToShow.map((date, index) => ({
    date,
    amount: mockAmounts[index],
    isToday: date.toDateString() === todayDateString
  }));
  
  // Convert the daily sales data to chart format
  const comparisonData: ChartPoint[] = mockSalesData.map((dayData, index) => {
    let period: string;
    let color: string;
    
    if (index === 0) {
      // First item is the selected day
      period = 'Inicial';
      color = '#897053'; // Primary color for selected day
    } else {
      // Previous days
      const daysAgo = index;
      if (daysAgo === 1) {
        period = 'Ant(1)';
        color = '#6b5d4a';
      } else if (daysAgo === 2) {
        period = 'Ant(2)';
        color = '#8b7355';
      } else {
        period = 'Ant(3)';
        color = '#7a6649';
      }
    }
    
    return {
      period,
      amount: dayData.amount,
      color,
      date: dayData.date,
      isSelected: index === 0
    };
  });
  
  return {
    selectedDay: {
      date: selectedDate,
      fullDayName: formatFullDayName(selectedDate),
      amount: mockSalesData[0].amount
    },
    comparisonData
  };
}

/**
 * Formats a day name for chart period labels.
 * Returns format like "Jue" for Thursday.
 */
function formatDayForChart(date: Date): string {
  const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

/**
 * Validates daily chart data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 * Ensures data is suitable for chart rendering and user display.
 * 
 * @function validateDailyChartData
 * @param {DailyChartData} chartData - Chart data to validate
 * @returns {ChartValidationResult} Detailed validation result with errors and warnings
 * 
 * @example
 * const data = generateMockDailyChartData(new Date());
 * const result = validateDailyChartData(data);
 * if (!result.isValid) {
 *   console.error('Chart validation failed:', result.errors);
 * }
 */
export function validateDailyChartData(chartData: DailyChartData): ChartValidationResult {
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
        source: 'daily-chart-data-validation',
        pointCount: 0
      }
    };
  }
  
  // Validate selectedDay data
  if (!chartData.selectedDay) {
    errors.push('Selected day data is required');
  } else {
    const { date, fullDayName, amount } = chartData.selectedDay;
    
    // Validate date
    if (!date || !(date instanceof Date)) {
      errors.push('Selected day date must be a valid Date object');
    } else if (isNaN(date.getTime())) {
      errors.push('Selected day date is invalid (NaN)');
    } else if (date > now) {
      warnings.push('Selected day is in the future');
    }
    
    // Validate fullDayName
    if (!fullDayName || typeof fullDayName !== 'string') {
      errors.push('Selected day fullDayName must be a non-empty string');
    }
    
    // Validate amount
    if (typeof amount !== 'number') {
      errors.push('Selected day amount must be a number');
    } else if (isNaN(amount)) {
      errors.push('Selected day amount is NaN');
    } else if (amount < 0) {
      errors.push('Selected day amount cannot be negative');
    } else if (amount === 0) {
      warnings.push('Selected day amount is zero');
    } else if (amount > 1000000000) {
      warnings.push(`Selected day amount seems unusually high (>${formatChartAmount(1000000000)})`);
    }
  }
  
  // Validate comparisonData array
  if (!chartData.comparisonData || !Array.isArray(chartData.comparisonData)) {
    errors.push('Comparison data must be an array');
  } else {
    // Should have exactly 4 comparison points
    if (chartData.comparisonData.length !== 4) {
      errors.push(`Comparison data should contain exactly 4 points, found ${chartData.comparisonData.length}`);
    }
    
    // Validate each comparison point
    chartData.comparisonData.forEach((point, index) => {
      const pointLabel = point.period || `Point ${index + 1}`;
      
      // Validate period label
      if (!point.period || typeof point.period !== 'string') {
        errors.push(`${pointLabel}: period must be a non-empty string`);
      }
      
      // Validate amount
      if (typeof point.amount !== 'number') {
        errors.push(`${pointLabel}: amount must be a number`);
      } else if (isNaN(point.amount)) {
        errors.push(`${pointLabel}: amount is NaN`);
      } else if (point.amount < 0) {
        errors.push(`${pointLabel}: amount cannot be negative`);
      } else if (point.amount === 0) {
        warnings.push(`${pointLabel}: amount is zero`);
      } else if (point.amount > 1000000000) {
        warnings.push(`${pointLabel}: amount seems unusually high (>${formatChartAmount(1000000000)})`);
      }
      
      // Validate color
      if (!point.color || typeof point.color !== 'string') {
        errors.push(`${pointLabel}: color must be a non-empty string`);
      } else if (!point.color.match(/^#[0-9A-Fa-f]{6}$/)) {
        warnings.push(`${pointLabel}: '${point.color}' may not be a valid hex color`);
      }
      
      // Validate date
      if (!point.date || !(point.date instanceof Date)) {
        errors.push(`${pointLabel}: date must be a valid Date object`);
      } else if (isNaN(point.date.getTime())) {
        errors.push(`${pointLabel}: date is invalid (NaN)`);
      } else if (point.date > now) {
        warnings.push(`${pointLabel}: date is in the future`);
      }
      
      // Validate isSelected flag
      if (typeof point.isSelected !== 'boolean') {
        errors.push(`${pointLabel}: isSelected must be a boolean`);
      }
    });
    
    // Check for exactly one selected point
    const selectedPoints = chartData.comparisonData.filter(point => point.isSelected);
    if (selectedPoints.length === 0) {
      errors.push('Exactly one comparison point must be marked as selected');
    } else if (selectedPoints.length > 1) {
      warnings.push(`Multiple comparison points marked as selected (${selectedPoints.length} found)`);
    }
    
    // Verify we have periods that make sense for daily comparison
    const actualPeriods = chartData.comparisonData.map(point => point.period);
    const hasSelectedDay = actualPeriods.some(period => period === 'Hoy' || period.includes('día') || period.includes('Ayer'));
    if (!hasSelectedDay) {
      warnings.push('No recognizable day periods found in comparison data');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'daily-chart-data-validation',
      pointCount: chartData.comparisonData?.length || 0,
      selectedDate: chartData.selectedDay?.date
    }
  };
}

/**
 * Gets the default chart theme matching the application's design system.
 * Provides consistent colors and styling that integrates with shadcn/ui and TailwindCSS.
 * Adapts to light/dark mode with proper contrast ratios.
 * 
 * @function getDefaultDailyChartTheme
 * @returns {DailyChartTheme} Theme configuration for the daily chart
 * 
 * @example
 * const theme = getDefaultDailyChartTheme();
 * // Use theme.comparisonColors for chart bar colors
 * // Use theme.primaryColor for highlights
 */
export function getDefaultDailyChartTheme(): DailyChartTheme {
  // Detect if dark mode is active
  const isDarkMode = typeof window !== 'undefined' && 
    document.documentElement.classList.contains('dark');
  
  return {
    primaryColor: '#897053', // Primary theme color for selected day
    comparisonColors: ['#897053', '#6b5d4a', '#8b7355', '#7a6649'], // Gradient of primary colors
    gridColor: isDarkMode ? '#3F3F3F' : '#D1D5DB', // More visible grid - matches border colors
    textColor: isDarkMode ? '#E0E0E0' : '#5A5A5A', // Matches theme foreground colors
    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F8F8', // Matches theme background
    tooltipBackground: isDarkMode ? '#2A2A2A' : '#FFFFFF', // Tooltip background
    tooltipBorder: isDarkMode ? '#4A4A4A' : '#E5E7EB' // Tooltip border
  };
}

/**
 * Converts API response data to chart-ready format.
 * Transforms the processed service data into the format expected by the chart component.
 *
 * @function convertApiDataToChartData
 * @param {ProcessedChartData} apiData - Processed data from the API service
 * @param {Date} selectedDate - The selected date for the chart
 * @returns {DailyChartData | null} Chart-ready data or null if conversion fails
 *
 * @example
 * const apiData = await fetchHoursChartData('2025-09-12');
 * const chartData = convertApiDataToChartData(apiData, new Date('2025-09-12'));
 */
export function convertApiDataToChartData(
  apiData: ProcessedChartData,
  selectedDate: Date
): DailyChartData | null {
  if (process.env.NODE_ENV === 'development') {
    console.log('🎉 convertApiDataToChartData: Input data', {
      selectedDate: selectedDate.toLocaleDateString('es-ES'),
      apiData,
      hasApiData: !!apiData,
      hasError: apiData?.hasError,
      hasDays: !!apiData?.days,
      daysLength: apiData?.days?.length,
      daysDetail: apiData?.days?.map(d => ({
        label: d.label,
        date: d.date,
        total: d.total
      }))
    });
  }

  // Check if we have valid data
  if (!apiData || apiData.hasError || !apiData.days || apiData.days.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('convertApiDataToChartData: Failed validation', {
        noApiData: !apiData,
        hasError: apiData?.hasError,
        noDays: !apiData?.days,
        emptyDays: apiData?.days?.length === 0
      });
    }
    return null;
  }

  // Colors for the 4 days
  const dayColors = ['#897053', '#6b5d4a', '#8b7355', '#7a6649'];

  // Convert API days to chart points - use real API dates and labels
  const comparisonData: ChartPoint[] = apiData.days.slice(0, 4).map((day, index) => {
    // Use safe date parsing to avoid timezone issues
    const dayDate = day.date ? parseLocalDate(day.date) : new Date(selectedDate);

    // Use the real label from API service (already formatted as "Sep 05")
    const periodLabel = day.label || `Día ${index + 1}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Chart point ${index}:`, {
        apiLabel: day.label,
        apiDate: day.date,
        parsedDate: dayDate.toLocaleDateString('es-ES'),
        periodLabel,
        amount: day.total
      });
    }

    return {
      period: periodLabel, // Real API date label (Sep 05)
      amount: day.total || 0,
      color: dayColors[index] || '#897053',
      date: dayDate, // Real API date
      isSelected: index === 0 // First day is the selected day
    };
  });

  // Get the selected day data (first day in the array)
  const selectedDayData = apiData.days[0];
  const selectedDayAmount = selectedDayData?.total || 0;

  return {
    selectedDay: {
      date: selectedDate,
      fullDayName: formatFullDayName(selectedDate),
      amount: selectedDayAmount
    },
    comparisonData
  };
}

/**
 * Validates date range for single day selection requirements.
 * Ensures the date range meets the daily chart component's display requirements.
 *
 * @function validateChartDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ChartValidationResult} Validation result with specific date range errors
 *
 * @example
 * const range = { from: new Date(), to: new Date() };
 * const result = validateChartDateRange(range);
 * if (result.isValid) {
 *   // Safe to display daily chart comparison
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

    // For single day selections, 'to' is optional - if missing, treat as single day
    if (dateRange.to) {
      if (!(dateRange.to instanceof Date)) {
        errors.push('End date must be a Date object');
      } else if (isNaN(dateRange.to.getTime())) {
        errors.push('End date is invalid');
      }
    }

    // Validate single day requirement
    if (dateRange.from && dateRange.from instanceof Date) {

      // If 'to' is provided, ensure it matches 'from' for single day
      if (dateRange.to && dateRange.to instanceof Date) {
        if (!isSingleDaySelected(dateRange)) {
          errors.push('Date range must represent exactly one day for daily chart comparison');
        }
      }
      // If no 'to' date, it's automatically treated as single day selection

      if (dateRange.from > now) {
        warnings.push('Selected day is in the future');
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
      selectedDate: dateRange?.from
    }
  };
}