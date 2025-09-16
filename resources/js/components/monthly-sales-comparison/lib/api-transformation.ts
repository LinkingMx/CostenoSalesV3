/**
 * API data transformation utilities for monthly sales components.
 * Handles conversion from raw API data to component-ready formats.
 */

import type { DateRange } from '@/components/main-filter-calendar';
import type { MonthlySummaryData } from '../types';

/**
 * Transforms API monthly chart data to monthly summary data for display.
 * Maps API range data (actual, last, two_las) to chronological monthly cards.
 * Dynamically calculates month names based on the current selected month.
 *
 * @function transformApiDataToMonthlySummary
 * @param {unknown} apiData - Monthly chart data from API with range.actual, range.last, range.two_las
 * @param {DateRange} [selectedDateRange] - Currently selected date range to determine month context
 * @returns {MonthlySummaryData[]} Array of 3 monthly summary objects in chronological order
 *
 * @example
 * const apiResponse = {
 *   data: {
 *     range: {
 *       actual: 102181858.01,    // Current selected month
 *       last: 245512460.24,     // Previous month
 *       two_las: 228086400.35   // Two months ago
 *     }
 *   }
 * };
 * const dateRange = { from: new Date('2025-08-01'), to: new Date('2025-08-31') };
 * const summaryData = transformApiDataToMonthlySummary(apiResponse, dateRange);
 * // Returns: [Junio 2025, Julio 2025, Agosto 2025] in chronological order
 */
export function transformApiDataToMonthlySummary(apiData: unknown, selectedDateRange?: DateRange): MonthlySummaryData[] {
    if (!apiData) {
        return [];
    }

    // Handle both processed chart data and raw API data with proper type guards
    let rangeData;

    // Type guard for API data structure
    if (typeof apiData === 'object' && apiData !== null) {
        const typedApiData = apiData as Record<string, unknown>;

        if (typedApiData.data && typeof typedApiData.data === 'object' && typedApiData.data !== null) {
            const nestedData = typedApiData.data as Record<string, unknown>;
            if (nestedData.range && typeof nestedData.range === 'object' && nestedData.range !== null) {
                // Full API response with nested data structure
                rangeData = nestedData.range as Record<string, unknown>;
            }
        } else if (typedApiData.range && typeof typedApiData.range === 'object' && typedApiData.range !== null) {
            // Direct range data format
            rangeData = typedApiData.range as Record<string, unknown>;
        }
    }

    if (!rangeData) {
        return [];
    }

    const { actual, last, two_las } = rangeData;

    const summaries: MonthlySummaryData[] = [];

    // Calculate month names dynamically based on selected date range
    // The API data represents: actual = latest month, last = previous month, two_las = two months ago
    // So if August is selected: actual = August, last = July, two_las = June

    let latestMonth: Date; // The month that corresponds to "actual"
    let previousMonth: Date; // The month that corresponds to "last"
    let twoMonthsAgo: Date; // The month that corresponds to "two_las"

    if (selectedDateRange?.from) {
        // The selected month is the latest month (corresponds to API "actual")
        latestMonth = new Date(selectedDateRange.from);
        previousMonth = new Date(latestMonth.getFullYear(), latestMonth.getMonth() - 1, 1);
        twoMonthsAgo = new Date(latestMonth.getFullYear(), latestMonth.getMonth() - 2, 1);
    } else {
        // Fallback to current date if no selection
        const now = new Date();
        latestMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    }

    // Get Spanish month names
    const getSpanishMonthYear = (date: Date): string => {
        const monthNames = [
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
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Create monthly summaries in chronological order: two months ago → previous → latest

    // Two months ago (two_las) - e.g., June if August is selected
    if (typeof two_las === 'number') {
        summaries.push({
            totalAmount: two_las,
            monthNameWithYear: getSpanishMonthYear(twoMonthsAgo),
            monthLabel: 'two_las',
        });
    }

    // Previous month (last) - e.g., July if August is selected
    if (typeof last === 'number') {
        summaries.push({
            totalAmount: last,
            monthNameWithYear: getSpanishMonthYear(previousMonth),
            monthLabel: 'last',
        });
    }

    // Latest/selected month (actual) - e.g., August if August is selected
    if (typeof actual === 'number') {
        summaries.push({
            totalAmount: actual,
            monthNameWithYear: getSpanishMonthYear(latestMonth),
            monthLabel: 'actual',
        });
    }

    return summaries;
}