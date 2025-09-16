/**
 * Mock data generation utilities for monthly sales components.
 * Provides realistic test data for development and testing purposes.
 */

import type { SalesMonthData } from '../types';
import { getMonthName } from './date-formatting';

/**
 * Generates realistic monthly sales amounts with business pattern variation.
 * Creates amounts that follow typical monthly sales fluctuations.
 * Different months have different seasonal patterns.
 *
 * @function generateRealisticMonthlySalesAmount
 * @param {Date} date - The date to generate sales for
 * @returns {number} Realistic sales amount with monthly variation
 *
 * @example
 * const january = new Date('2025-01-01');
 * const amount = generateRealisticMonthlySalesAmount(january);
 * // Returns amount like 450,000,000.00 with realistic monthly business variation
 */
function generateRealisticMonthlySalesAmount(date: Date): number {
    const baseAmount = 450000000; // Base amount of $450M MXN for months
    const month = date.getMonth(); // 0-11 for Jan-Dec

    // Apply realistic business patterns based on month
    // These factors reflect typical retail/sales patterns in Mexican markets
    let monthFactor = 1;
    switch (month) {
        case 0: // January - post-holiday slowdown
            monthFactor = 0.8; // 20% below baseline
            break;
        case 1: // February - Valentine's Day boost
            monthFactor = 0.9; // 10% below baseline
            break;
        case 2: // March - spring pickup
            monthFactor = 1.0; // baseline
            break;
        case 3: // April - Easter season
            monthFactor = 1.1; // 10% above baseline
            break;
        case 4: // May - Mother's Day, spring peak
            monthFactor = 1.15; // 15% above baseline
            break;
        case 5: // June - summer start
            monthFactor = 1.05; // 5% above baseline
            break;
        case 6: // July - summer vacation
            monthFactor = 0.95; // 5% below baseline
            break;
        case 7: // August - back to school prep
            monthFactor = 1.2; // 20% above baseline
            break;
        case 8: // September - back to school peak
            monthFactor = 1.25; // 25% above baseline
            break;
        case 9: // October - Halloween, autumn
            monthFactor = 1.1; // 10% above baseline
            break;
        case 10: // November - Black Friday, pre-Christmas
            monthFactor = 1.4; // 40% above baseline (highest)
            break;
        case 11: // December - Christmas season
            monthFactor = 1.35; // 35% above baseline
            break;
        default:
            monthFactor = 1; // Fallback for unexpected values
    }

    const variation = 0.2; // 20% variation range
    const randomFactor = (Math.random() - 0.5) * 2 * variation + 1;

    return Math.round(baseAmount * monthFactor * randomFactor * 100) / 100;
}

/**
 * Generates mock monthly sales data for development and testing purposes.
 * Creates realistic sales amounts for the selected month plus 2 previous months (August and July).
 * Includes proper timezone handling for date comparisons.
 *
 * @function generateMockMonthlySalesData
 * @param {Date[]} dates - Array of monthly dates to generate sales data for
 * @returns {SalesMonthData[]} Array of mock monthly sales data for 3 months
 *
 * @example
 * const months = generateMonthDays(new Date('2025-09-01'));
 * const mockData = generateMockMonthlySalesData(months);
 * // Returns realistic monthly sales data for Sep 25, Aug 25, Jul 25
 */
export function generateMockMonthlySalesData(dates: Date[]): SalesMonthData[] {
    // Calculate the current month boundaries for accurate comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    currentMonthStart.setHours(0, 0, 0, 0);
    currentMonthEnd.setHours(23, 59, 59, 999);

    // Generate data for 3 months: selected month, August, and July
    const allMonths: Date[] = [];

    if (dates.length > 0) {
        const selectedDate = dates[0];

        // Add the selected month
        allMonths.push(new Date(selectedDate));

        // Add August 2025
        const augustDate = new Date(2025, 7, 1); // Month 7 = August
        allMonths.push(augustDate);

        // Add July 2025
        const julyDate = new Date(2025, 6, 1); // Month 6 = July
        allMonths.push(julyDate);
    }

    // Use specific dummy amounts for better demo data
    const dummyAmounts = [
        614812492.36, // September
        587654123.89, // August
        523789456.12, // July
    ];

    return allMonths.map((date, index) => ({
        date,
        amount: dummyAmounts[index] || generateRealisticMonthlySalesAmount(date),
        monthName: getMonthName(date),
        // Timezone-safe comparison: check if this date falls within current month
        isCurrentMonth: date >= currentMonthStart && date <= currentMonthEnd,
    }));
}