/**
 * Monthly Chart Comparison Utilities
 * Helper functions for monthly chart data validation and processing
 */

import type { MonthlyChartData, MonthlyChartValidationResult } from './types';
import { isCompleteMonthSelected as isCompleteMonth } from '@/lib/date-validation';

// Re-export the month validation function for consistency
export const isCompleteMonthSelected = isCompleteMonth;

/**
 * Spanish month names
 */
export const SPANISH_MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Generate mock monthly chart data for development
 */
export const generateMockMonthlyChartData = (startDate: Date): MonthlyChartData => {
  const currentMonth = startDate.getMonth();
  const currentYear = startDate.getFullYear();

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Generate daily data for up to 31 days
  const dailyData = [];
  const maxDays = 31;

  // Get days for each month
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const daysInLastMonth = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );
  const daysInTwoMonthsAgo = getDaysInMonth(
    currentMonth <= 1 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 10 : currentMonth === 1 ? 11 : currentMonth - 2
  );

  // Generate realistic business patterns
  for (let day = 1; day <= maxDays; day++) {
    const dayOfWeek = ((day - 1) % 7);

    // Base daily averages
    const currentMonthBase = 20000000; // 20M daily average
    const lastMonthBase = 19000000;    // 19M daily average
    const twoMonthsAgoBase = 18000000; // 18M daily average

    // Apply day-of-week multipliers
    let multiplier = 1.0;
    if (dayOfWeek === 5) multiplier = 1.15; // Saturday - higher
    else if (dayOfWeek === 6) multiplier = 0.85; // Sunday - lower
    else if (dayOfWeek === 4) multiplier = 1.2; // Friday - highest
    else if (dayOfWeek === 0) multiplier = 0.9; // Monday - slower

    // Add random variation (-20% to +20%)
    const variation = 0.8 + Math.random() * 0.4;

    dailyData.push({
      dayNumber: day,
      dayLabel: `${day}`,
      month1: day <= daysInCurrentMonth ? currentMonthBase * multiplier * variation : 0,
      month2: day <= daysInLastMonth ? lastMonthBase * multiplier * variation : 0,
      month3: day <= daysInTwoMonthsAgo ? twoMonthsAgoBase * multiplier * variation : 0,
    });
  }

  // Generate month labels
  const monthLabels: string[] = [];

  // Current month
  monthLabels.push(`${SPANISH_MONTHS[currentMonth]} ${currentYear}`);

  // Previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  monthLabels.push(`${SPANISH_MONTHS[prevMonth]} ${prevYear}`);

  // Two months ago
  const twoMonthsAgoMonth = prevMonth === 0 ? 11 : prevMonth - 1;
  const twoMonthsAgoYear = prevMonth === 0 ? prevYear - 1 : prevYear;
  monthLabels.push(`${SPANISH_MONTHS[twoMonthsAgoMonth]} ${twoMonthsAgoYear}`);

  return {
    dailyData,
    monthLabels,
    monthColors: ['#897053', '#6b5d4a', '#4a3d2f'],
    legendLabels: ['Mes actual', 'Mes anterior', 'Hace 2 meses'],
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

  // Validate dailyData array
  if (!Array.isArray(data.dailyData)) {
    errors.push('dailyData must be an array');
  } else if (data.dailyData.length === 0) {
    errors.push('dailyData array is empty');
  } else if (data.dailyData.length > 31) {
    warnings.push('dailyData has more than 31 days');
  }

  // Validate each day's data
  data.dailyData?.forEach((day, index) => {
    if (typeof day.dayNumber !== 'number') {
      errors.push(`Day ${index}: dayNumber must be a number`);
    }
    if (typeof day.month1 !== 'number' || day.month1 < 0) {
      errors.push(`Day ${index}: month1 must be a non-negative number`);
    }
    if (typeof day.month2 !== 'number' || day.month2 < 0) {
      errors.push(`Day ${index}: month2 must be a non-negative number`);
    }
    if (typeof day.month3 !== 'number' || day.month3 < 0) {
      errors.push(`Day ${index}: month3 must be a non-negative number`);
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
    maximumFractionDigits: 2
  }).format(amount).replace('MXN', '$').trim();
}

/**
 * Gets the default chart theme matching the application's design system.
 * Uses same theme as weekly components for consistency.
 */
export function getDefaultChartTheme() {
  // Detect if dark mode is active
  const isDarkMode = typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  return {
    primaryColor: '#897053', // Primary theme color
    monthColors: ['#897053', '#6b5d4a', '#4a3d2f'], // Gradient of primary colors
    gridColor: isDarkMode ? '#3F3F3F' : '#D1D5DB', // More visible grid - matches border colors
    textColor: isDarkMode ? '#E0E0E0' : '#5A5A5A', // Matches theme foreground colors
    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F8F8' // Matches theme background
  };
}

