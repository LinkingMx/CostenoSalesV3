/**
 * Monthly Chart Comparison Utilities
 * Helper functions for monthly chart data validation and processing
 */

import { isCompleteMonthSelected as isCompleteMonth } from '@/lib/date-validation';
import type { MonthlyChartData, MonthlyChartValidationResult } from './types';

// Re-export the month validation function for consistency
export const isCompleteMonthSelected = isCompleteMonth;

/**
 * Spanish month names
 */
export const SPANISH_MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

/**
 * Generate mock monthly chart data for development
 */
export const generateMockMonthlyChartData = (startDate: Date): MonthlyChartData => {
    const currentMonth = startDate.getMonth();
    const currentYear = startDate.getFullYear();

    // Generate realistic monthly totals (not daily data)
    // Current month total: ~600M MXN
    const currentMonthTotal = 580000000 + Math.random() * 40000000; // 580M - 620M

    // Previous month: slightly lower (~580M MXN)
    const lastMonthTotal = 560000000 + Math.random() * 40000000; // 560M - 600M

    // Two months ago: seasonal variation (~540M MXN)
    const twoMonthsAgoTotal = 520000000 + Math.random() * 40000000; // 520M - 560M

    // Generate month labels (chronological order for display)
    const monthLabels: string[] = [];
    const monthValues: number[] = [];

    // Two months ago
    const twoMonthsAgoMonth = currentMonth <= 1 ? (currentMonth === 0 ? 10 : 11) : currentMonth - 2;
    const twoMonthsAgoYear = currentMonth <= 1 ? currentYear - 1 : currentYear;
    monthLabels.push(`${SPANISH_MONTHS[twoMonthsAgoMonth]} ${twoMonthsAgoYear}`);
    monthValues.push(twoMonthsAgoTotal);

    // Previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    monthLabels.push(`${SPANISH_MONTHS[prevMonth]} ${prevYear}`);
    monthValues.push(lastMonthTotal);

    // Current month
    monthLabels.push(`${SPANISH_MONTHS[currentMonth]} ${currentYear}`);
    monthValues.push(currentMonthTotal);

    return {
        monthLabels,
        monthValues,
        monthColors: ['#4a3d2f', '#6b5d4a', '#897053'], // Gradient from older to current
        legendLabels: ['Hace 2 meses', 'Mes anterior', 'Mes actual'],
    };
};

/**
 * Validate monthly chart data
 */
export const validateMonthlyChartData = (data: MonthlyChartData): MonthlyChartValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data exists
    if (!data) {
        errors.push('Monthly chart data is null or undefined');
        return { isValid: false, errors, warnings };
    }

    // Validate monthValues array
    if (!Array.isArray(data.monthValues)) {
        errors.push('monthValues must be an array');
    } else if (data.monthValues.length === 0) {
        errors.push('monthValues array is empty');
    } else if (data.monthValues.length !== 3) {
        errors.push('monthValues must have exactly 3 values (for 3 months)');
    }

    // Validate each month's value
    data.monthValues?.forEach((value, index) => {
        if (typeof value !== 'number') {
            errors.push(`Month ${index}: value must be a number`);
        } else if (value < 0) {
            errors.push(`Month ${index}: value must be non-negative`);
        } else if (value > 10000000000) { // 10B MXN seems unrealistic
            warnings.push(`Month ${index}: value ${value} seems unusually high`);
        }
    });

    // Validate month labels
    if (!Array.isArray(data.monthLabels) || data.monthLabels.length !== 3) {
        errors.push('monthLabels must be an array with exactly 3 labels');
    }

    // Validate month colors
    if (!Array.isArray(data.monthColors) || data.monthColors.length !== 3) {
        errors.push('monthColors must be an array with exactly 3 colors');
    }

    // Validate legend labels
    if (!Array.isArray(data.legendLabels) || data.legendLabels.length !== 3) {
        errors.push('legendLabels must be an array with exactly 3 labels');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

/**
 * Formats a sales amount as a Mexican peso currency string.
 * Uses the same formatting as weekly components for consistency.
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
        maximumFractionDigits: 2,
    })
        .format(amount)
        .replace('MXN', '$')
        .trim();
}

/**
 * Gets the default chart theme matching the application's design system.
 * Uses same theme as weekly components for consistency.
 */
export function getDefaultChartTheme() {
    // Detect if dark mode is active
    const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    return {
        primaryColor: '#897053', // Primary theme color
        monthColors: ['#897053', '#6b5d4a', '#4a3d2f'], // Gradient of primary colors
        gridColor: isDarkMode ? '#3F3F3F' : '#D1D5DB', // More visible grid - matches border colors
        textColor: isDarkMode ? '#E0E0E0' : '#5A5A5A', // Matches theme foreground colors
        backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F8F8', // Matches theme background
    };
}
