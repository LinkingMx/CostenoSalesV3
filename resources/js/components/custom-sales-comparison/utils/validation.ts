import type { DateRange } from '@/components/main-filter-calendar';
import type { SalesCustomData, ValidationResult, CustomRangeMetrics } from '../types';
import { isCustomRangeSelected } from '@/lib/date-validation';

// Re-export the custom range validation function
export { isCustomRangeSelected };

/**
 * Validates custom range sales data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 * 
 * @function validateCustomSalesData
 * @param {SalesCustomData[]} salesData - Array of custom range sales data to validate
 * @returns {ValidationResult} Detailed validation result with errors and warnings
 * 
 * @example
 * const data = [{ 
 *   date: new Date(), 
 *   amount: 1000, 
 *   isInRange: true, 
 *   dayName: 'Lunes', 
 *   formattedDate: '15 Sep' 
 * }];
 * const result = validateCustomSalesData(data);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 */
export function validateCustomSalesData(salesData: SalesCustomData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();
  
  // Check for empty or null data
  if (!salesData || salesData.length === 0) {
    errors.push('Custom sales data array is empty or null');
    return {
      isValid: false,
      errors,
      warnings,
      metadata: {
        validatedAt: now,
        source: 'custom-sales-data-validation',
        itemCount: 0
      }
    };
  }
  
  // Should have at least 2 items for custom range (minimum 2 days)
  if (salesData.length < 2) {
    errors.push(`Custom sales data should contain at least 2 days, found ${salesData.length}`);
  }
  
  // Should not exceed 365 days
  if (salesData.length > 365) {
    errors.push(`Custom sales data should not exceed 365 days, found ${salesData.length}`);
  }
  
  // Validate each sales record
  salesData.forEach((item, index) => {
    const dayLabel = `Day ${index + 1} (${item.formattedDate || 'Unknown'})`;
    
    // Validate date
    if (!item.date || !(item.date instanceof Date)) {
      errors.push(`${dayLabel}: Invalid or missing date`);
    } else if (isNaN(item.date.getTime())) {
      errors.push(`${dayLabel}: Date is invalid (NaN)`);
    } else if (item.date > now) {
      warnings.push(`${dayLabel}: Date is in the future`);
    }
    
    // Validate amount
    if (typeof item.amount !== 'number') {
      errors.push(`${dayLabel}: Amount must be a number`);
    } else if (isNaN(item.amount)) {
      errors.push(`${dayLabel}: Amount is NaN`);
    } else if (item.amount < 0) {
      errors.push(`${dayLabel}: Amount cannot be negative`);
    } else if (item.amount === 0) {
      warnings.push(`${dayLabel}: Amount is zero`);
    } else if (item.amount > 10000000) {
      warnings.push(`${dayLabel}: Amount seems unusually high (>$10M)`);
    }
    
    // Validate isInRange flag
    if (typeof item.isInRange !== 'boolean') {
      errors.push(`${dayLabel}: isInRange must be a boolean`);
    }
    
    // Validate dayName
    if (typeof item.dayName !== 'string' || item.dayName.trim() === '') {
      errors.push(`${dayLabel}: dayName must be a non-empty string`);
    }
    
    // Validate formattedDate
    if (typeof item.formattedDate !== 'string' || item.formattedDate.trim() === '') {
      errors.push(`${dayLabel}: formattedDate must be a non-empty string`);
    }
  });
  
  // Check for date continuity and ordering
  if (salesData.length > 1) {
    const sortedData = [...salesData].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    for (let i = 1; i < sortedData.length; i++) {
      const prevDate = sortedData[i - 1].date;
      const currDate = sortedData[i].date;
      const timeDiff = currDate.getTime() - prevDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff > 1) {
        warnings.push(`Gap detected: Missing ${daysDiff - 1} day(s) between ${prevDate.toDateString()} and ${currDate.toDateString()}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'custom-sales-data-validation',
      itemCount: salesData.length,
      rangeDays: salesData.length
    }
  };
}

/**
 * Validates date range for custom range selection requirements.
 * Ensures the date range meets the custom component's display requirements.
 * 
 * @function validateCustomDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ValidationResult} Validation result with specific custom range errors
 * 
 * @example
 * const range = { from: new Date('2025-09-01'), to: new Date('2025-09-15') };
 * const result = validateCustomDateRange(range);
 * if (result.isValid) {
 *   // Safe to display custom sales comparison
 * }
 */
export function validateCustomDateRange(dateRange: DateRange | undefined): ValidationResult {
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
    
    if (!dateRange.to) {
      errors.push('End date (to) is required');
    } else if (!(dateRange.to instanceof Date)) {
      errors.push('End date must be a Date object');
    } else if (isNaN(dateRange.to.getTime())) {
      errors.push('End date is invalid');
    }
    
    // Validate custom range requirement
    if (dateRange.from && dateRange.to && 
        dateRange.from instanceof Date && dateRange.to instanceof Date) {
      
      if (!isCustomRangeSelected(dateRange)) {
        errors.push('Date range must represent a custom range (not single day, complete week, or complete month) for custom sales comparison');
      }
      
      // Calculate range days for additional validations
      const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 1) {
        errors.push('Custom date range must be at least 2 days');
      }
      
      if (daysDiff > 365) {
        errors.push('Custom date range cannot exceed 365 days');
      }
      
      if (dateRange.from > now) {
        warnings.push('Selected custom range starts in the future');
      }
      
      if (daysDiff > 90) {
        warnings.push(`Large date range selected (${daysDiff + 1} days) - may impact performance`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: now,
      source: 'custom-date-range-validation'
    }
  };
}

/**
 * Calculates comprehensive metrics for a custom date range.
 * Provides aggregated statistics and performance indicators.
 * 
 * @function calculateCustomRangeMetrics
 * @param {SalesCustomData[]} salesData - Array of custom range sales data
 * @param {DateRange} dateRange - The date range being analyzed
 * @returns {CustomRangeMetrics} Calculated metrics for the custom range
 * 
 * @example
 * const metrics = calculateCustomRangeMetrics(salesData, customRange);
 * console.log(`Total sales: ${metrics.totalSales}, Average: ${metrics.averageDaily}`);
 */
export function calculateCustomRangeMetrics(
  salesData: SalesCustomData[], 
  dateRange: DateRange
): CustomRangeMetrics {
  if (!salesData || salesData.length === 0) {
    return {
      totalSales: 0,
      averageDaily: 0,
      totalDays: 0,
      startDate: dateRange.from || new Date(),
      endDate: dateRange.to || new Date(),
      highestDay: 0,
      lowestDay: 0
    };
  }
  
  const amounts = salesData.map(item => item.amount);
  const totalSales = amounts.reduce((sum, amount) => sum + amount, 0);
  const totalDays = salesData.length;
  const averageDaily = totalDays > 0 ? totalSales / totalDays : 0;
  const highestDay = Math.max(...amounts);
  const lowestDay = Math.min(...amounts);
  
  return {
    totalSales,
    averageDaily,
    totalDays,
    startDate: dateRange.from || new Date(),
    endDate: dateRange.to || new Date(),
    highestDay,
    lowestDay
  };
}