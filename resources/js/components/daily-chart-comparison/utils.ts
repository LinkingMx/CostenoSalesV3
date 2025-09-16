import type { DateRange } from '@/components/main-filter-calendar';
import { parseLocalDate } from '@/lib/services/hours-chart.service';
import type { ProcessedChartData } from '@/lib/services/types';
import { formatCurrencyAmount, formatFullDayName } from '@/lib/utils/currency-formatting';
import { validateDailyDateRange } from '@/lib/utils/date-validation';
import type { ChartPoint, ChartValidationResult, DailyChartData, DailyChartTheme } from './types';

// isSingleDaySelected is now imported from shared utilities

// formatFullDayName is now imported from shared utilities

// formatChartAmount is now replaced by formatCurrencyAmount from shared utilities
export const formatChartAmount = formatCurrencyAmount;

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
        isToday: date.toDateString() === todayDateString,
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
            isSelected: index === 0,
        };
    });

    return {
        selectedDay: {
            date: selectedDate,
            fullDayName: formatFullDayName(selectedDate),
            amount: mockSalesData[0].amount,
        },
        comparisonData,
    };
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
                pointCount: 0,
            },
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
        const selectedPoints = chartData.comparisonData.filter((point) => point.isSelected);
        if (selectedPoints.length === 0) {
            errors.push('Exactly one comparison point must be marked as selected');
        } else if (selectedPoints.length > 1) {
            warnings.push(`Multiple comparison points marked as selected (${selectedPoints.length} found)`);
        }

        // Verify we have periods that make sense for daily comparison
        const actualPeriods = chartData.comparisonData.map((point) => point.period);
        const hasSelectedDay = actualPeriods.some((period) => period === 'Hoy' || period.includes('día') || period.includes('Ayer'));
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
            selectedDate: chartData.selectedDay?.date,
        },
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
    const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

    return {
        primaryColor: '#897053', // Primary theme color for selected day
        comparisonColors: ['#897053', '#6b5d4a', '#8b7355', '#7a6649'], // Gradient of primary colors
        gridColor: isDarkMode ? '#3F3F3F' : '#D1D5DB', // More visible grid - matches border colors
        textColor: isDarkMode ? '#E0E0E0' : '#5A5A5A', // Matches theme foreground colors
        backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F8F8', // Matches theme background
        tooltipBackground: isDarkMode ? '#2A2A2A' : '#FFFFFF', // Tooltip background
        tooltipBorder: isDarkMode ? '#4A4A4A' : '#E5E7EB', // Tooltip border
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
export function convertApiDataToChartData(apiData: ProcessedChartData, selectedDate: Date): DailyChartData | null {
    // Check if we have valid data
    if (!apiData || apiData.hasError || !apiData.days || apiData.days.length === 0) {
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

        return {
            period: periodLabel, // Real API date label (Sep 05)
            amount: day.total || 0,
            color: dayColors[index] || '#897053',
            date: dayDate, // Real API date
            isSelected: index === 0, // First day is the selected day
        };
    });

    // Get the selected day data (first day in the array)
    const selectedDayData = apiData.days[0];
    const selectedDayAmount = selectedDayData?.total || 0;

    return {
        selectedDay: {
            date: selectedDate,
            fullDayName: formatFullDayName(selectedDate),
            amount: selectedDayAmount,
        },
        comparisonData,
    };
}

// validateChartDateRange is now replaced by validateDailyDateRange from shared utilities
export const validateChartDateRange = (dateRange: DateRange | undefined): ChartValidationResult => {
    const result = validateDailyDateRange(dateRange);
    // Convert ValidationResult to ChartValidationResult format
    return {
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        metadata: {
            validatedAt: result.metadata?.validatedAt || new Date(),
            source: 'chart-date-range-validation',
            selectedDate: result.metadata?.selectedDate,
        },
    };
};
