import type { DateRange } from '@/components/main-filter-calendar';
import type { SalesCustomData } from '../types';
import { formatDateForCustomCard, getDayName } from './formatting';

/**
 * Generates an array of dates within a custom date range.
 * Creates consecutive dates from start to end of the custom range.
 *
 * @function generateCustomRangeDays
 * @param {Date} startDate - The start date of the range
 * @param {Date} endDate - The end date of the range
 * @returns {Date[]} Array of consecutive dates
 *
 * @example
 * const start = new Date('2025-09-01');
 * const end = new Date('2025-09-05');
 *
 * generateCustomRangeDays(start, end);
 * // Returns: [Sept 1, Sept 2, Sept 3, Sept 4, Sept 5]
 */
export function generateCustomRangeDays(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);

    // Generate dates from start to end (inclusive)
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

/**
 * Generates realistic custom range sales amounts with business pattern variation.
 * Creates amounts that follow typical daily sales fluctuations with weekday patterns.
 * Weekend sales typically lower, weekdays higher with mid-week peaks.
 *
 * @function generateRealisticCustomSalesAmount
 * @param {Date} date - The date to generate sales for
 * @param {number} baseAmount - Base daily sales amount (default: 850,000 MXN)
 * @returns {number} Realistic sales amount with daily variation
 *
 * @example
 * const monday = new Date('2025-09-15'); // Monday
 * const amount = generateRealisticCustomSalesAmount(monday);
 * // Returns amount like 920,500.00 with realistic daily business variation
 */
function generateRealisticCustomSalesAmount(date: Date, baseAmount: number = 850000): number {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Apply realistic business patterns based on day of week
    // These factors reflect typical retail/sales patterns in Mexican markets
    let dayFactor = 1;
    switch (dayOfWeek) {
        case 0: // Sunday - lowest sales day
            dayFactor = 0.6; // 40% below baseline
            break;
        case 1: // Monday - slow start
            dayFactor = 0.8; // 20% below baseline
            break;
        case 2: // Tuesday - building momentum
            dayFactor = 0.95; // 5% below baseline
            break;
        case 3: // Wednesday - mid-week peak
            dayFactor = 1.15; // 15% above baseline
            break;
        case 4: // Thursday - another strong day
            dayFactor = 1.2; // 20% above baseline
            break;
        case 5: // Friday - payday effect
            dayFactor = 1.3; // 30% above baseline (highest)
            break;
        case 6: // Saturday - weekend shopping
            dayFactor = 1.1; // 10% above baseline
            break;
        default:
            dayFactor = 1; // Fallback for unexpected values
    }

    // Add some randomness to make it more realistic
    const variation = 0.15; // 15% variation range
    const randomFactor = (Math.random() - 0.5) * 2 * variation + 1;

    return Math.round(baseAmount * dayFactor * randomFactor * 100) / 100;
}

/**
 * Generates mock custom range sales data for development and testing purposes.
 * Creates realistic sales amounts based on the provided custom date range.
 * Includes proper timezone handling and business logic for different days.
 *
 * @function generateMockCustomSalesData
 * @param {DateRange} dateRange - Date range to generate sales data for
 * @returns {SalesCustomData[]} Array of mock custom range sales data
 *
 * @example
 * const range = { from: new Date('2025-09-01'), to: new Date('2025-09-10') };
 * const mockData = generateMockCustomSalesData(range);
 * // Returns realistic custom range sales data for 10 days
 */
export function generateMockCustomSalesData(dateRange: DateRange): SalesCustomData[] {
    if (!dateRange.from || !dateRange.to) {
        return [];
    }

    const dates = generateCustomRangeDays(dateRange.from, dateRange.to);

    return dates.map((date) => ({
        date,
        amount: generateRealisticCustomSalesAmount(date),
        isInRange: true, // All generated dates are within the custom range
        dayName: getDayName(date),
        formattedDate: formatDateForCustomCard(date),
    }));
}

/**
 * Generates mock custom range sales data with seasonal variations.
 * Applies additional seasonal factors based on the month and time of year.
 * Useful for creating more realistic year-round test data.
 *
 * @function generateMockCustomSalesDataWithSeasonal
 * @param {DateRange} dateRange - Date range to generate sales data for
 * @param {number} baseAmount - Base daily sales amount
 * @returns {SalesCustomData[]} Array of mock custom range sales data with seasonal factors
 *
 * @example
 * const range = { from: new Date('2025-12-01'), to: new Date('2025-12-25') };
 * const mockData = generateMockCustomSalesDataWithSeasonal(range, 1000000);
 * // Returns Christmas season sales data with increased amounts
 */
export function generateMockCustomSalesDataWithSeasonal(dateRange: DateRange, baseAmount: number = 850000): SalesCustomData[] {
    if (!dateRange.from || !dateRange.to) {
        return [];
    }

    const dates = generateCustomRangeDays(dateRange.from, dateRange.to);

    return dates.map((date) => {
        const month = date.getMonth(); // 0-11 for Jan-Dec

        // Apply seasonal factors similar to monthly patterns but for daily amounts
        let seasonalFactor = 1;
        switch (month) {
            case 0: // January - post-holiday slowdown
                seasonalFactor = 0.85;
                break;
            case 1: // February - Valentine's Day boost
                seasonalFactor = 0.95;
                break;
            case 2: // March - spring pickup
                seasonalFactor = 1.0;
                break;
            case 3: // April - Easter season
                seasonalFactor = 1.05;
                break;
            case 4: // May - Mother's Day
                seasonalFactor = 1.1;
                break;
            case 5: // June - summer start
                seasonalFactor = 1.0;
                break;
            case 6: // July - summer vacation
                seasonalFactor = 0.9;
                break;
            case 7: // August - back to school
                seasonalFactor = 1.15;
                break;
            case 8: // September - back to school peak
                seasonalFactor = 1.2;
                break;
            case 9: // October - autumn
                seasonalFactor = 1.05;
                break;
            case 10: // November - Black Friday
                seasonalFactor = 1.3;
                break;
            case 11: // December - Christmas
                seasonalFactor = 1.35;
                break;
            default:
                seasonalFactor = 1;
        }

        return {
            date,
            amount: generateRealisticCustomSalesAmount(date, baseAmount * seasonalFactor),
            isInRange: true,
            dayName: getDayName(date),
            formattedDate: formatDateForCustomCard(date),
        };
    });
}

/**
 * Calculates summary statistics for custom range sales data.
 * Provides useful metrics for display and analysis.
 *
 * @function calculateCustomRangeSummary
 * @param {SalesCustomData[]} salesData - Array of custom range sales data
 * @returns {object} Summary statistics object
 *
 * @example
 * const summary = calculateCustomRangeSummary(mockData);
 * console.log(`Total: ${summary.total}, Average: ${summary.average}`);
 */
export function calculateCustomRangeSummary(salesData: SalesCustomData[]) {
    if (!salesData || salesData.length === 0) {
        return {
            total: 0,
            average: 0,
            highest: 0,
            lowest: 0,
            days: 0,
        };
    }

    const amounts = salesData.map((item) => item.amount);
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const average = total / amounts.length;
    const highest = Math.max(...amounts);
    const lowest = Math.min(...amounts);

    return {
        total,
        average,
        highest,
        lowest,
        days: salesData.length,
    };
}
