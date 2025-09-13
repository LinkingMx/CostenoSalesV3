/**
 * Shared Date Validation Utilities
 * Common validation logic used across daily components
 */

import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Checks if the selected date range represents exactly one day.
 * Handles both explicit single-day ranges and implicit single-day selections.
 *
 * @function isSingleDaySelected
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one day is selected, false otherwise
 *
 * @example
 * const singleDay = { from: new Date('2025-09-12'), to: new Date('2025-09-12') };
 * const implicitSingle = { from: new Date('2025-09-12'), to: undefined };
 * const range = { from: new Date('2025-09-12'), to: new Date('2025-09-15') };
 *
 * isSingleDaySelected(singleDay);      // true
 * isSingleDaySelected(implicitSingle); // true
 * isSingleDaySelected(range);          // false
 * isSingleDaySelected(undefined);      // false
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
 * Validates if a date range is suitable for daily component display.
 * Common validation logic used by both daily-chart-comparison and daily-sales-comparison.
 *
 * @function validateDailyDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ValidationResult} Validation result with errors and warnings
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    validatedAt: Date;
    source: string;
    selectedDate?: Date;
  };
}

export function validateDailyDateRange(dateRange: DateRange | undefined): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date();

  if (!dateRange) {
    errors.push('Date range is required for daily component display');
  } else {
    if (!dateRange.from) {
      errors.push('Start date (from) is required');
    } else if (!(dateRange.from instanceof Date)) {
      errors.push('Start date must be a Date object');
    } else if (isNaN(dateRange.from.getTime())) {
      errors.push('Start date is invalid');
    }

    // For single day selections, 'to' is optional
    if (dateRange.to) {
      if (!(dateRange.to instanceof Date)) {
        errors.push('End date must be a Date object');
      } else if (isNaN(dateRange.to.getTime())) {
        errors.push('End date is invalid');
      }
    }

    // Validate single day requirement
    if (dateRange.from && dateRange.from instanceof Date) {
      if (dateRange.to && dateRange.to instanceof Date) {
        if (!isSingleDaySelected(dateRange)) {
          errors.push('Date range must represent exactly one day for daily component');
        }
      }

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
      source: 'daily-date-range-validation',
      selectedDate: dateRange?.from
    }
  };
}