/**
 * Validation utilities for monthly sales components.
 * Provides runtime validation and type guards for data integrity.
 */

import type { DateRange } from '@/components/main-filter-calendar';
import { isCompleteMonthSelected } from '@/lib/date-validation';
import type { SalesMonthData, ValidationResult } from '../types';
import { getMonthName } from './date-formatting';

// Re-export the month validation function
export { isCompleteMonthSelected };

/**
 * Validates monthly sales data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 *
 * @function validateMonthlySalesData
 * @param {SalesMonthData[]} salesData - Array of monthly sales data to validate
 * @returns {ValidationResult} Detailed validation result with errors and warnings
 *
 * @example
 * const data = [{ date: new Date(), amount: 1000, isCurrentMonth: true, monthName: 'Enero' }];
 * const result = validateMonthlySalesData(data);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 */
export function validateMonthlySalesData(salesData: SalesMonthData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();

    // Check for empty or null data
    if (!salesData || salesData.length === 0) {
        errors.push('Monthly sales data array is empty or null');
        return {
            isValid: false,
            errors,
            warnings,
            metadata: {
                validatedAt: now,
                source: 'monthly-sales-data-validation',
                itemCount: 0,
            },
        };
    }

    // Should have exactly 3 items (selected month + August + July)
    if (salesData.length !== 3) {
        errors.push(`Monthly sales data should contain exactly 3 months, found ${salesData.length}`);
    }

    // Validate each sales record
    salesData.forEach((item, index) => {
        const monthName = getMonthName(item.date);

        // Validate date
        if (!item.date || !(item.date instanceof Date)) {
            errors.push(`Item ${index}: Date is required and must be a Date object`);
        } else if (isNaN(item.date.getTime())) {
            errors.push(`Item ${index}: Date is invalid`);
        }

        // Validate amount
        if (typeof item.amount !== 'number') {
            errors.push(`Item ${index}: Amount must be a number`);
        } else if (item.amount < 0) {
            errors.push(`Item ${index}: Amount cannot be negative`);
        } else if (item.amount > 1000000000) {
            warnings.push(`Item ${index}: Amount ${item.amount} seems unusually high`);
        }

        // Validate isCurrentMonth
        if (typeof item.isCurrentMonth !== 'boolean') {
            errors.push(`Item ${index}: isCurrentMonth must be a boolean`);
        }

        // Validate monthName consistency
        if (typeof item.monthName !== 'string') {
            errors.push(`Item ${index}: monthName must be a string`);
        } else if (item.monthName !== monthName) {
            warnings.push(`Item ${index}: monthName "${item.monthName}" doesn't match calculated month "${monthName}"`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'monthly-sales-data-validation',
            itemCount: salesData.length,
        },
    };
}

/**
 * Validates date range for complete month selection requirements.
 * Ensures the date range meets the monthly component's display requirements.
 *
 * @function validateMonthDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ValidationResult} Validation result with specific month date range errors
 *
 * @example
 * const range = { from: new Date('2025-09-01'), to: new Date('2025-09-30') };
 * const result = validateMonthDateRange(range);
 * if (result.isValid) {
 *   // Safe to display monthly sales comparison
 * }
 */
export function validateMonthDateRange(dateRange: DateRange | undefined): ValidationResult {
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

        // Validate complete month requirement
        if (dateRange.from && dateRange.to && dateRange.from instanceof Date && dateRange.to instanceof Date) {
            if (!isCompleteMonthSelected(dateRange)) {
                errors.push('Date range must represent exactly one complete month (first day to last day) for monthly sales comparison');
            }

            if (dateRange.from > now) {
                warnings.push('Start date is in the future');
            }

            if (dateRange.to > now) {
                warnings.push('End date is in the future');
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'monthly-date-range-validation',
        },
    };
}

/**
 * Type guard function to validate API data structure.
 * Ensures the data has the expected shape before processing.
 *
 * @param data - Raw data to validate
 * @returns true if data has valid API structure, false otherwise
 */
export function isValidApiData(data: unknown): data is Record<string, unknown> {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const typedData = data as Record<string, unknown>;

    // Check for nested data structure (full API response)
    if (typedData.data && typeof typedData.data === 'object' && typedData.data !== null) {
        const nestedData = typedData.data as Record<string, unknown>;
        return !!(nestedData.range && typeof nestedData.range === 'object' && nestedData.range !== null);
    }

    // Check for direct range data format
    return !!(typedData.range && typeof typedData.range === 'object' && typedData.range !== null);
}