import type { DateRange } from '@/components/main-filter-calendar';
import { logger } from './logger';
import type { SalesCustomData } from '../types';

/**
 * Type guard to check if a value is a valid SalesCustomData object
 * @param value - Value to check
 * @returns True if value is a valid SalesCustomData object
 */
export function isSalesCustomData(value: unknown): value is SalesCustomData {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return (
        obj.date instanceof Date &&
        !isNaN(obj.date.getTime()) &&
        typeof obj.amount === 'number' &&
        !isNaN(obj.amount) &&
        typeof obj.isInRange === 'boolean' &&
        typeof obj.dayName === 'string' &&
        obj.dayName.trim().length > 0 &&
        typeof obj.formattedDate === 'string' &&
        obj.formattedDate.trim().length > 0
    );
}

/**
 * Type guard to check if a value is a valid array of SalesCustomData
 * @param value - Value to check
 * @returns True if value is a valid SalesCustomData array
 */
export function isSalesCustomDataArray(value: unknown): value is SalesCustomData[] {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every((item, index) => {
        const isValid = isSalesCustomData(item);
        if (!isValid) {
            logger.warn('Invalid SalesCustomData item in array', { index, item });
        }
        return isValid;
    });
}

/**
 * Type guard to check if a DateRange is valid for custom sales comparison
 * @param dateRange - DateRange to validate
 * @returns True if dateRange is valid for custom comparison
 */
export function isValidCustomDateRange(dateRange: unknown): dateRange is DateRange {
    if (!dateRange || typeof dateRange !== 'object') {
        return false;
    }

    const range = dateRange as Record<string, unknown>;

    if (!(range.from instanceof Date) || !(range.to instanceof Date)) {
        return false;
    }

    if (isNaN(range.from.getTime()) || isNaN(range.to.getTime())) {
        return false;
    }

    if (range.from >= range.to) {
        return false;
    }

    // Calculate range in days
    const daysDiff = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));

    // Must be between 2 and 365 days
    return daysDiff >= 2 && daysDiff <= 365;
}

/**
 * Type guard to check if API response is valid for custom sales
 * @param response - API response to validate
 * @returns True if response has expected structure
 */
export function isValidApiResponse(response: unknown): response is { data: SalesCustomData[]; error?: string } {
    if (!response || typeof response !== 'object') {
        return false;
    }

    const resp = response as Record<string, unknown>;

    // Check if it has the expected structure
    if (!('data' in resp)) {
        return false;
    }

    // If there's an error, it should be a string
    if ('error' in resp && typeof resp.error !== 'string') {
        return false;
    }

    // If data exists, it should be a valid sales data array
    if (resp.data !== null && resp.data !== undefined) {
        return isSalesCustomDataArray(resp.data);
    }

    return true;
}

/**
 * Type guard with runtime validation and detailed error reporting
 * @param value - Value to validate as SalesCustomData
 * @param context - Optional context for error reporting
 * @returns Object with validation result and detailed errors
 */
export function validateSalesCustomDataItem(
    value: unknown,
    context?: string
): { isValid: boolean; errors: string[]; data?: SalesCustomData } {
    const errors: string[] = [];
    const contextPrefix = context ? `${context}: ` : '';

    if (!value || typeof value !== 'object') {
        errors.push(`${contextPrefix}Value must be an object`);
        return { isValid: false, errors };
    }

    const obj = value as Record<string, unknown>;

    // Validate date
    if (!(obj.date instanceof Date)) {
        errors.push(`${contextPrefix}date must be a Date instance`);
    } else if (isNaN(obj.date.getTime())) {
        errors.push(`${contextPrefix}date is invalid (NaN)`);
    }

    // Validate amount
    if (typeof obj.amount !== 'number') {
        errors.push(`${contextPrefix}amount must be a number`);
    } else if (isNaN(obj.amount)) {
        errors.push(`${contextPrefix}amount is NaN`);
    } else if (obj.amount < 0) {
        errors.push(`${contextPrefix}amount cannot be negative`);
    }

    // Validate isInRange
    if (typeof obj.isInRange !== 'boolean') {
        errors.push(`${contextPrefix}isInRange must be a boolean`);
    }

    // Validate dayName
    if (typeof obj.dayName !== 'string') {
        errors.push(`${contextPrefix}dayName must be a string`);
    } else if (obj.dayName.trim().length === 0) {
        errors.push(`${contextPrefix}dayName cannot be empty`);
    }

    // Validate formattedDate
    if (typeof obj.formattedDate !== 'string') {
        errors.push(`${contextPrefix}formattedDate must be a string`);
    } else if (obj.formattedDate.trim().length === 0) {
        errors.push(`${contextPrefix}formattedDate cannot be empty`);
    }

    const isValid = errors.length === 0;

    return {
        isValid,
        errors,
        data: isValid ? (obj as unknown as SalesCustomData) : undefined
    };
}