import type { DateRange } from '@/components/main-filter-calendar';
import type { SalesDayData, ValidationResult } from './types';
import type { ProcessedChartData } from '@/lib/services/types';
import { parseLocalDate } from '@/lib/services/hours-chart.service';

/**
 * Checks if the selected date range represents exactly one day.
 * Returns true only when both from and to dates exist and are the same day.
 * 
 * @function isSingleDaySelected
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one day is selected, false otherwise
 * 
 * @example
 * const singleDay = { from: new Date('2025-09-11'), to: new Date('2025-09-11') };
 * const range = { from: new Date('2025-09-11'), to: new Date('2025-09-15') };
 * 
 * isSingleDaySelected(singleDay); // true
 * isSingleDaySelected(range);     // false
 * isSingleDaySelected(undefined); // false
 */
export function isSingleDaySelected(dateRange: DateRange | undefined): boolean {
  if (!dateRange?.from || !dateRange?.to) {
    return false;
  }
  
  return dateRange.from.getTime() === dateRange.to.getTime();
}

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

/**
 * Formats a sales amount as a currency string with thousands separators.
 * Uses Mexican peso format with $ symbol and proper MXN locale.
 * Includes configurable currency support for future internationalization.
 * 
 * @function formatSalesAmount
 * @param {number} amount - The sales amount to format
 * @param {string} currency - Currency code (default: 'MXN' for Mexican pesos)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatSalesAmount(250533.98); // "$250,533.98"
 * formatSalesAmount(7068720.45); // "$7,068,720.45"
 * formatSalesAmount(1000000, 'USD'); // "$1,000,000.00" (USD format)
 */
export function formatSalesAmount(
  amount: number, 
  currency: 'MXN' | 'USD' | 'COP' = 'MXN'
): string {
  // Currency configuration mapping
  const currencyConfig = {
    MXN: { locale: 'es-MX', symbol: '$' },
    USD: { locale: 'en-US', symbol: '$' },
    COP: { locale: 'es-CO', symbol: '$' }
  };
  
  const config = currencyConfig[currency];
  
  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  // Replace currency code with symbol for cleaner display
  return formatted.replace(currency, config.symbol).trim();
}

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
  const selectedDateString = selectedDate.toDateString();
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

/**
 * Validates date range for single day selection requirements.
 * Ensures the date range meets the component's display requirements.
 *
 * @function validateDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ValidationResult} Validation result with specific date range errors
 *
 * @example
 * const range = { from: new Date(), to: new Date() };
 * const result = validateDateRange(range);
 * if (result.isValid) {
 *   // Safe to display daily sales comparison
 * }
 */
export function validateDateRange(dateRange: DateRange | undefined): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();

  if (!dateRange) {
    errors.push('Date range is required');
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
        if (dateRange.from.getTime() !== dateRange.to.getTime()) {
          errors.push('Date range must represent exactly one day for daily sales comparison');
        }
      }
      // If no 'to' date, it's automatically treated as single day selection

      if (dateRange.from > now) {
        warnings.push('Selected date is in the future');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'date-range-validation'
    }
  };
}