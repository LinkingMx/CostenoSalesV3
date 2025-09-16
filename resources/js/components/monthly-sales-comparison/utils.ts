import type { DateRange } from '@/components/main-filter-calendar';
import { isCompleteMonthSelected } from '@/lib/date-validation';
import type { MonthlySummaryData, SalesMonthData, ValidationResult } from './types';

// Re-export the month validation function
export { isCompleteMonthSelected };

/**
 * Generates an array of monthly dates from a date range.
 * Creates a single date representing the selected month.
 * Works with complete month selections.
 *
 * @function generateMonthDays
 * @param {Date} startDate - The start date of the range (first day of month)
 * @returns {Date[]} Array of 1 date representing the month
 *
 * @example
 * const firstDay = new Date('2025-09-01'); // First day of September
 *
 * generateMonthDays(firstDay);  // Returns: [Sept 1] (representing September 2025)
 */
export function generateMonthDays(startDate: Date): Date[] {
    return [new Date(startDate)];
}

/**
 * Formats a sales amount as a currency string with thousands separators.
 * Uses Mexican peso format with $ symbol and proper MXN locale.
 * Includes configurable currency support for future internationalization.
 *
 * @function formatSalesAmount
 * @param {number} amount - The sales amount to format
 * @param {string} currency - Currency code (default: 'MXN' for Mexican pesos)
 * @returns {string} Formatted currency string
 *
 * @example
 * formatSalesAmount(250533.98); // "$250,533.98"
 * formatSalesAmount(7068720.45); // "$7,068,720.45"
 * formatSalesAmount(1000000, 'USD'); // "$1,000,000.00" (USD format)
 */
export function formatSalesAmount(amount: number, currency: 'MXN' | 'USD' | 'COP' = 'MXN'): string {
    // Currency configuration mapping
    const currencyConfig = {
        MXN: { locale: 'es-MX', symbol: '$' },
        USD: { locale: 'en-US', symbol: '$' },
        COP: { locale: 'es-CO', symbol: '$' },
    };

    const config = currencyConfig[currency];

    const formatted = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);

    // Replace currency code with symbol for cleaner display
    return formatted.replace(currency, config.symbol).trim();
}

/**
 * Formats a date for display in the monthly sales cards.
 * Returns format like "Sep 25" or "Jul 25".
 *
 * @function formatDateForMonthCard
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string with abbreviated month and short year
 *
 * @example
 * const january = new Date('2025-01-01');
 * const september = new Date('2025-09-01');
 *
 * formatDateForMonthCard(january);  // "Ene 25"
 * formatDateForMonthCard(september); // "Sep 25"
 */
export function formatDateForMonthCard(date: Date): string {
    const monthNames = {
        0: 'Ene',
        1: 'Feb',
        2: 'Mar',
        3: 'Abr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Ago',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dic',
    };

    const month = date.getMonth();
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year

    return `${monthNames[month as keyof typeof monthNames]} ${year}`;
}

/**
 * Gets the first letter for the circular indicator in the monthly sales card.
 * Returns the first letter of the Spanish month name (E, F, M, A, etc.).
 *
 * @function getMonthLetter
 * @param {Date} date - The date to get the letter for
 * @returns {string} Single letter representing the month
 *
 * @example
 * const january = new Date('2025-01-01');    // Enero
 * const march = new Date('2025-03-01');      // Marzo
 *
 * getMonthLetter(january);    // "E"
 * getMonthLetter(march);      // "M"
 */
export function getMonthLetter(date: Date): string {
    const monthName = date.toLocaleDateString('es-MX', { month: 'long' });
    return monthName.charAt(0).toUpperCase();
}

/**
 * Gets the full Spanish month name for a given date.
 *
 * @function getMonthName
 * @param {Date} date - The date to get the month name for
 * @returns {string} Full Spanish month name
 *
 * @example
 * const january = new Date('2025-01-01');
 * getMonthName(january); // "Enero"
 */
export function getMonthName(date: Date): string {
    return date.toLocaleDateString('es-MX', { month: 'long' }).charAt(0).toUpperCase() + date.toLocaleDateString('es-MX', { month: 'long' }).slice(1);
}

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
    salesData.forEach((item) => {
        const monthName = getMonthName(item.date);

        // Validate date
        if (!item.date || !(item.date instanceof Date)) {
            errors.push(`${monthName}: Invalid or missing date`);
        } else if (isNaN(item.date.getTime())) {
            errors.push(`${monthName}: Date is invalid (NaN)`);
        } else if (item.date > now) {
            warnings.push(`${monthName}: Date is in the future`);
        }

        // Validate amount
        if (typeof item.amount !== 'number') {
            errors.push(`${monthName}: Amount must be a number`);
        } else if (isNaN(item.amount)) {
            errors.push(`${monthName}: Amount is NaN`);
        } else if (item.amount < 0) {
            errors.push(`${monthName}: Amount cannot be negative`);
        } else if (item.amount === 0) {
            warnings.push(`${monthName}: Amount is zero`);
        } else if (item.amount > 1000000000) {
            warnings.push(`${monthName}: Amount seems unusually high (>${formatSalesAmount(1000000000)})`);
        }

        // Validate isCurrentMonth flag
        if (typeof item.isCurrentMonth !== 'boolean') {
            errors.push(`${monthName}: isCurrentMonth must be a boolean`);
        }

        // Validate monthName
        if (typeof item.monthName !== 'string' || item.monthName.trim() === '') {
            errors.push(`${monthName}: monthName must be a non-empty string`);
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
                warnings.push('Selected month is in the future');
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'month-date-range-validation',
        },
    };
}

/**
 * Formats a chart amount as Mexican peso currency for display in monthly charts.
 * Uses the same formatting approach as weekly components for consistency.
 *
 * @function formatChartAmount
 * @param {number} amount - The sales amount to format
 * @returns {string} Formatted currency string
 *
 * @example
 * formatChartAmount(228086400.35); // "$228,086,400.35"
 * formatChartAmount(102181858.01); // "$102,181,858.01"
 */
export function formatChartAmount(amount: number): string {
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
 * Formats a sales amount as Mexican peso currency for display in monthly summary cards.
 * Uses consistent formatting with other components.
 *
 * @function formatMonthlySalesAmount
 * @param {number} amount - The sales amount to format
 * @returns {string} Formatted currency string
 *
 * @example
 * formatMonthlySalesAmount(245512460.24); // "$245,512,460.24"
 */
export function formatMonthlySalesAmount(amount: number): string {
    return formatChartAmount(amount);
}

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
