import type { DateRange } from '@/components/main-filter-calendar';
import type { SalesDayData, ValidationResult } from './types';
import type { ProcessedChartData } from '@/lib/services/types';
import { parseLocalDate } from '@/lib/services/hours-chart.service';
import { validateDailyDateRange } from '@/lib/utils/date-validation';
import { formatCurrencyAmount } from '@/lib/utils/currency-formatting';

// isSingleDaySelected is now imported from shared utilities

/**
 * Generates an array of the selected date plus the 3 previous days.
 * Returns the dates in reverse chronological order (most recent first).
 * 
 * @function generatePreviousDays
 * @param {Date} selectedDate - The base date to generate previous days from
 * @returns {Date[]} Array of 4 dates: selected date + 3 previous days
 * 
 * @example
 * const selected = new Date('2025-09-11');
 * const days = generatePreviousDays(selected);
 * // Returns: [2025-09-11, 2025-09-10, 2025-09-09, 2025-09-08]
 */
export function generatePreviousDays(selectedDate: Date): Date[] {
  const days: Date[] = [];
  
  for (let i = 0; i < 4; i++) {
    const day = new Date(selectedDate);
    day.setDate(selectedDate.getDate() - i);
    days.push(day);
  }
  
  return days;
}

// formatSalesAmount is now replaced by formatCurrencyAmount from shared utilities
export const formatSalesAmount = formatCurrencyAmount;

/**
 * Formats a date for display in the sales cards.
 * Returns format like "Hoy - 11/09/2025" or "Jue - 04/09/2025".
 * 
 * @function formatDateForCard
 * @param {Date} date - The date to format
 * @param {boolean} isToday - Whether this date is today
 * @returns {string} Formatted date string
 * 
 * @example
 * const today = new Date('2025-09-11');
 * const yesterday = new Date('2025-09-10');
 * 
 * formatDateForCard(today, true);    // "Hoy - 11/09/2025"
 * formatDateForCard(yesterday, false); // "Jue - 10/09/2025"
 */
export function formatDateForCard(date: Date, isToday: boolean): string {
  if (isToday) {
    const formatted = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
    return `Hoy ${formatted}`;
  }

  const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
  const formatted = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit'
  });

  // Capitalize first letter and format as "Vie 13/09"
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  return `${capitalizedDay} ${formatted}`;
}

/**
 * Gets the first letter for the circular indicator in the sales card.
 * Returns "H" for today, or the first letter of the day name for other days.
 * 
 * @function getDayLetter
 * @param {Date} date - The date to get the letter for
 * @param {boolean} isToday - Whether this date is today
 * @returns {string} Single letter representing the day
 * 
 * @example
 * const today = new Date('2025-09-11');
 * const thursday = new Date('2025-09-05');
 * 
 * getDayLetter(today, true);     // "H"
 * getDayLetter(thursday, false); // "J" (Jueves)
 */
export function getDayLetter(date: Date, isToday: boolean): string {
  if (isToday) {
    return 'H';
  }

  const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
  return dayName.charAt(0).toUpperCase();
}

/**
 * Generates mock sales data for development and testing purposes.
 * Creates realistic sales amounts based on the provided dates.
 * Includes proper timezone handling for date comparisons.
 * 
 * @function generateMockSalesData
 * @param {Date[]} dates - Array of dates to generate sales data for
 * @returns {SalesDayData[]} Array of mock sales data
 * 
 * @example
 * const dates = generatePreviousDays(new Date('2025-09-11'));
 * const mockData = generateMockSalesData(dates);
 * // Returns realistic sales data for each date
 */
export function generateMockSalesData(dates: Date[]): SalesDayData[] {
  // Fix timezone issue: normalize today's date to avoid timezone comparison problems
  const today = new Date();
  const todayDateString = today.toDateString();
  const mockAmounts = [250533.98, 7068720.45, 8166555.62, 8064541.02];
  
  return dates.map((date, index) => ({
    date,
    amount: mockAmounts[index] || generateRealisticSalesAmount(),
    // Fixed timezone comparison: use normalized date strings
    isToday: date.toDateString() === todayDateString
  }));
}

/**
 * Generates realistic sales amounts with business pattern variation.
 * Creates amounts that follow typical daily sales fluctuations.
 * 
 * @function generateRealisticSalesAmount
 * @returns {number} Realistic sales amount with variation
 * 
 * @example
 * const amount = generateRealisticSalesAmount();
 * // Returns amount like 8,234,567.89 with realistic business variation
 */
function generateRealisticSalesAmount(): number {
  const baseAmount = 8000000; // Base amount of $8M MXN
  const variation = 0.4; // 40% variation range
  const weekdayFactor = Math.random() > 0.3 ? 1 : 0.7; // Weekend sales typically lower
  const randomFactor = (Math.random() - 0.5) * 2 * variation + 1;
  
  return Math.round(baseAmount * randomFactor * weekdayFactor * 100) / 100;
}

/**
 * Validates sales day data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 * 
 * @function validateSalesDayData
 * @param {SalesDayData[]} salesData - Array of sales data to validate
 * @returns {ValidationResult} Detailed validation result with errors and warnings
 * 
 * @example
 * const data = [{ date: new Date(), amount: 1000, isToday: true }];
 * const result = validateSalesDayData(data);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 */
export function validateSalesDayData(salesData: SalesDayData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();
  
  // Check for empty or null data
  if (!salesData || salesData.length === 0) {
    errors.push('Sales data array is empty or null');
    return {
      isValid: false,
      errors,
      warnings,
      metadata: {
        validatedAt: now,
        source: 'sales-data-validation',
        itemCount: 0
      }
    };
  }
  
  // Validate each sales record
  salesData.forEach((item, index) => {
    // Validate date
    if (!item.date || !(item.date instanceof Date)) {
      errors.push(`Item ${index + 1}: Invalid or missing date`);
    } else if (isNaN(item.date.getTime())) {
      errors.push(`Item ${index + 1}: Date is invalid (NaN)`);
    } else if (item.date > now) {
      warnings.push(`Item ${index + 1}: Date is in the future`);
    }
    
    // Validate amount
    if (typeof item.amount !== 'number') {
      errors.push(`Item ${index + 1}: Amount must be a number`);
    } else if (isNaN(item.amount)) {
      errors.push(`Item ${index + 1}: Amount is NaN`);
    } else if (item.amount < 0) {
      errors.push(`Item ${index + 1}: Amount cannot be negative`);
    } else if (item.amount === 0) {
      warnings.push(`Item ${index + 1}: Amount is zero`);
    } else if (item.amount > 1000000000) {
      warnings.push(`Item ${index + 1}: Amount seems unusually high (>${formatSalesAmount(1000000000)})`);
    }
    
    // Validate isToday flag
    if (typeof item.isToday !== 'boolean') {
      errors.push(`Item ${index + 1}: isToday must be a boolean`);
    }
  });
  
  // Check for multiple "today" entries
  const todayItems = salesData.filter(item => item.isToday);
  if (todayItems.length > 1) {
    warnings.push(`Multiple items marked as "today" (${todayItems.length} found)`);
  }
  
  // Check for duplicate dates
  const dateStrings = salesData
    .filter(item => item.date instanceof Date)
    .map(item => item.date.toDateString());
  const uniqueDates = new Set(dateStrings);
  if (dateStrings.length !== uniqueDates.size) {
    warnings.push('Duplicate dates found in sales data');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'sales-data-validation',
      itemCount: salesData.length
    }
  };
}

/**
 * Converts ProcessedChartData from the API to SalesDayData array for display.
 * Maps the days data from the hours chart service to the format needed by daily-sales-comparison.
 *
 * @function convertProcessedChartDataToSalesData
 * @param {ProcessedChartData} chartData - Processed data from hours chart service
 * @param {Date} selectedDate - The selected date to determine "today"
 * @returns {SalesDayData[]} Array of sales data for display in daily-sales-comparison
 *
 * @example
 * const apiData = { days: [...], isEmpty: false, hasError: false };
 * const salesData = convertProcessedChartDataToSalesData(apiData, new Date());
 * // Returns array of 4 days with sales amounts
 */
export function convertProcessedChartDataToSalesData(
  chartData: ProcessedChartData,
  selectedDate: Date
): SalesDayData[] {
  if (!chartData || chartData.hasError || chartData.isEmpty || !chartData.days) {
    return [];
  }

  // Normalize dates for comparison
  const todayDateString = new Date().toDateString();

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 convertProcessedChartDataToSalesData:', {
      selectedDate: selectedDate.toLocaleDateString('es-ES'),
      apiDays: chartData.days.map(d => ({
        label: d.label,
        date: d.date,
        total: d.total
      }))
    });
  }

  // Convert ProcessedDayData to SalesDayData
  // The API returns 4 days in reverse chronological order (most recent first)
  return chartData.days.map((day, index) => {
    // Use safe date parsing to avoid timezone issues
    const dayDate = parseLocalDate(day.date);
    const dayDateString = dayDate.toDateString();

    if (process.env.NODE_ENV === 'development') {
      console.log(`📅 Sales card ${index}:`, {
        apiLabel: day.label,
        apiDate: day.date,
        parsedDate: dayDate.toLocaleDateString('es-ES'),
        dayOfWeek: dayDate.toLocaleDateString('es-ES', { weekday: 'short' }),
        amount: day.total
      });
    }

    return {
      date: dayDate,
      amount: day.total,
      // Check if this day matches today's date (not the selected date)
      isToday: dayDateString === todayDateString
    };
  });
}

// validateDateRange is now replaced by validateDailyDateRange from shared utilities
export const validateDateRange = (dateRange: DateRange | undefined): ValidationResult => {
  const result = validateDailyDateRange(dateRange);
  // Convert to local ValidationResult format
  return {
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    metadata: {
      validatedAt: result.metadata?.validatedAt || new Date(),
      source: 'date-range-validation'
    }
  };
};