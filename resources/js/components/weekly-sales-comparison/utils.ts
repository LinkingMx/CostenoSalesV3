import type { DateRange } from '@/components/main-filter-calendar';
import type { SalesWeekData, ValidationResult, WeeklySummaryData } from './types';

/**
 * Checks if the selected date range represents a complete week (Monday to Sunday).
 * Returns true when the date range spans exactly 7 consecutive days from Monday to Sunday.
 *
 * @function isWorkWeekSelected
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one complete week is selected, false otherwise
 *
 * @example
 * const completeWeek = { from: monday, to: sunday };     // Monday-Sunday (7 days)
 * const partialWeek = { from: tuesday, to: sunday };     // Missing Monday
 * const twoWeeks = { from: monday1, to: sunday2 };       // Two weeks
 *
 * isWorkWeekSelected(completeWeek); // true
 * isWorkWeekSelected(partialWeek);  // false
 * isWorkWeekSelected(twoWeeks);     // false
 * isWorkWeekSelected(undefined);    // false
 */
export function isWorkWeekSelected(dateRange: DateRange | undefined): boolean {
    if (!dateRange?.from || !dateRange?.to) {
        return false;
    }

    const fromDay = dateRange.from.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const toDay = dateRange.to.getDay();

    // Calculate the difference in days
    const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Must be exactly 6 days difference (7 days = 6 day difference)
    if (daysDiff !== 6) {
        return false;
    }

    // Accept two week formats:
    // 1. Monday to Sunday: fromDay === 1 (Monday) AND toDay === 0 (Sunday)
    // 2. Sunday to Saturday: fromDay === 0 (Sunday) AND toDay === 6 (Saturday)
    return (fromDay === 1 && toDay === 0) || (fromDay === 0 && toDay === 6);
}

/**
 * Generates an array of weekday dates (Monday to Friday) from a date range.
 * Finds the Monday within the range and generates the full work week.
 * Works with both exact work weeks and full week selections.
 *
 * @function generateWeekdays
 * @param {Date} startDate - The start date of the range
 * @returns {Date[]} Array of 5 dates representing Monday through Friday
 *
 * @example
 * const monday = new Date('2025-09-02'); // Monday
 * const sunday = new Date('2025-09-01'); // Sunday (will find Monday within range)
 *
 * generateWeekdays(monday);  // Returns: [Sept 2, 3, 4, 5, 6] (Mon-Fri)
 * generateWeekdays(sunday);  // Returns: [Sept 2, 3, 4, 5, 6] (Mon-Fri from range)
 */
export function generateWeekdays(startDate: Date): Date[] {
    const weekdays: Date[] = [];

    // Simply use the start date and generate 7 consecutive days
    // This works for both Sunday-Saturday and Monday-Sunday formats
    const firstDay = new Date(startDate);

    // Generate 7 consecutive days starting from the provided start date
    for (let i = 0; i < 7; i++) {
        const day = new Date(firstDay);
        day.setDate(firstDay.getDate() + i);
        weekdays.push(day);
    }

    return weekdays;
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
 * Formats a date for display in the weekly sales cards.
 * Returns format like "Lunes - 15/09/2025" or "Viernes - 19/09/2025".
 *
 * @function formatDateForWeekCard
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string with day name
 *
 * @example
 * const monday = new Date('2025-09-15');
 * const friday = new Date('2025-09-19');
 *
 * formatDateForWeekCard(monday);  // "Lun - 15/09/2025"
 * formatDateForWeekCard(friday);  // "Vie - 19/09/2025"
 */
export function formatDateForWeekCard(date: Date): string {
    const dayName = date.toLocaleDateString('es-MX', { weekday: 'short' });
    const formatted = date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} - ${formatted}`;
}

/**
 * Gets the first letter for the circular indicator in the weekly sales card.
 * Returns the first letter of the Spanish day name (L, M, X, J, V).
 *
 * @function getDayLetter
 * @param {Date} date - The date to get the letter for
 * @returns {string} Single letter representing the day
 *
 * @example
 * const monday = new Date('2025-09-15');    // Lunes
 * const wednesday = new Date('2025-09-17'); // Miércoles
 *
 * getDayLetter(monday);    // "L"
 * getDayLetter(wednesday); // "X"
 */
export function getDayLetter(date: Date): string {
    const dayName = date.toLocaleDateString('es-MX', { weekday: 'long' });

    // Special handling for Miércoles (Wednesday) to use "X"
    if (dayName.toLowerCase().includes('miércoles')) {
        return 'X';
    }

    return dayName.charAt(0).toUpperCase();
}

/**
 * Gets the full Spanish day name for a given date.
 *
 * @function getDayName
 * @param {Date} date - The date to get the day name for
 * @returns {string} Full Spanish day name
 *
 * @example
 * const monday = new Date('2025-09-15');
 * getDayName(monday); // "Lunes"
 */
export function getDayName(date: Date): string {
    return (
        date.toLocaleDateString('es-MX', { weekday: 'long' }).charAt(0).toUpperCase() + date.toLocaleDateString('es-MX', { weekday: 'long' }).slice(1)
    );
}

/**
 * Generates realistic weekly sales amounts with business pattern variation.
 * Creates amounts that follow typical weekly sales fluctuations.
 * Monday and Friday typically have different patterns than mid-week.
 *
 * @function generateRealisticWeeklySalesAmount
 * @param {Date} date - The date to generate sales for
 * @returns {number} Realistic sales amount with weekly variation
 *
 * @example
 * const monday = new Date('2025-09-15');
 * const amount = generateRealisticWeeklySalesAmount(monday);
 * // Returns amount like 12,234,567.89 with realistic weekly business variation
 */
function generateRealisticWeeklySalesAmount(date: Date): number {
    const baseAmount = 15000000; // Base amount of $15M MXN for weekdays
    const dayOfWeek = date.getDay();

    // Apply realistic business patterns based on day of the week
    // These factors reflect typical retail/sales patterns in Mexican markets
    let dayFactor = 1;
    switch (dayOfWeek) {
        case 0: // Sunday - weekend activity, but typically lower than weekdays
            dayFactor = 0.7; // 30% below baseline
            break;
        case 1: // Monday - slower start (people returning from weekend)
            dayFactor = 0.85; // 15% below baseline
            break;
        case 2: // Tuesday - mid-week pickup (business normalizes)
            dayFactor = 1.1; // 10% above baseline
            break;
        case 3: // Wednesday - peak mid-week (optimal business day)
            dayFactor = 1.2; // 20% above baseline
            break;
        case 4: // Thursday - strong day (pre-weekend preparation)
            dayFactor = 1.15; // 15% above baseline
            break;
        case 5: // Friday - end of week rush (weekend shopping, paydays)
            dayFactor = 1.3; // 30% above baseline (highest)
            break;
        case 6: // Saturday - weekend activity, good but less than Friday
            dayFactor = 1.1; // 10% above baseline
            break;
        default:
            dayFactor = 1; // Fallback for unexpected values
    }

    const variation = 0.3; // 30% variation range
    const randomFactor = (Math.random() - 0.5) * 2 * variation + 1;

    return Math.round(baseAmount * dayFactor * randomFactor * 100) / 100;
}

/**
 * Generates mock weekly sales data for development and testing purposes.
 * Creates realistic sales amounts based on the provided weekday dates.
 * Includes proper timezone handling for date comparisons.
 *
 * @function generateMockWeeklySalesData
 * @param {Date[]} dates - Array of weekday dates to generate sales data for
 * @returns {SalesWeekData[]} Array of mock weekly sales data
 *
 * @example
 * const weekdays = generateWeekdays(new Date('2025-09-15'));
 * const mockData = generateMockWeeklySalesData(weekdays);
 * // Returns realistic weekly sales data for each weekday
 */
export function generateMockWeeklySalesData(dates: Date[]): SalesWeekData[] {
    // Calculate the current work week boundaries for accurate comparison
    // This addresses timezone issues by normalizing dates to start/end of day
    const now = new Date();

    // Find Monday of current week
    // If today is Sunday (0), go back 6 days; otherwise go back (dayOfWeek - 1) days
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    currentWeekStart.setHours(0, 0, 0, 0); // Set to start of day

    // Calculate Friday of current week (Monday + 4 days)
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 4);
    currentWeekEnd.setHours(23, 59, 59, 999); // Set to end of day

    return dates.map((date) => ({
        date,
        amount: generateRealisticWeeklySalesAmount(date),
        dayName: getDayName(date),
        // Timezone-safe comparison: check if this date falls within current work week
        // Uses normalized date boundaries to avoid timezone-related false negatives
        isCurrentWeek: date >= currentWeekStart && date <= currentWeekEnd,
    }));
}

/**
 * Validates weekly sales data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 *
 * @function validateWeeklySalesData
 * @param {SalesWeekData[]} salesData - Array of weekly sales data to validate
 * @returns {ValidationResult} Detailed validation result with errors and warnings
 *
 * @example
 * const data = [{ date: new Date(), amount: 1000, isCurrentWeek: true, dayName: 'Lunes' }];
 * const result = validateWeeklySalesData(data);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 */
export function validateWeeklySalesData(salesData: SalesWeekData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();

    // Check for empty or null data
    if (!salesData || salesData.length === 0) {
        errors.push('Weekly sales data array is empty or null');
        return {
            isValid: false,
            errors,
            warnings,
            metadata: {
                validatedAt: now,
                source: 'weekly-sales-data-validation',
                itemCount: 0,
            },
        };
    }

    // Should have exactly 7 items for a complete week
    if (salesData.length !== 7) {
        errors.push(`Weekly sales data should contain exactly 7 days, found ${salesData.length}`);
    }

    // Validate each sales record
    salesData.forEach((item, index) => {
        // Day names depend on whether we start with Sunday or Monday
        // We'll determine this from the first day in the array
        const firstDayOfWeek = salesData[0]?.date?.getDay();
        let dayNames: string[];

        if (firstDayOfWeek === 0) {
            // Sunday-Saturday format
            dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        } else {
            // Monday-Sunday format
            dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        }

        const dayName = dayNames[index];

        // Validate date
        if (!item.date || !(item.date instanceof Date)) {
            errors.push(`${dayName}: Invalid or missing date`);
        } else if (isNaN(item.date.getTime())) {
            errors.push(`${dayName}: Date is invalid (NaN)`);
        } else if (item.date > now) {
            warnings.push(`${dayName}: Date is in the future`);
        }

        // Validate amount
        if (typeof item.amount !== 'number') {
            errors.push(`${dayName}: Amount must be a number`);
        } else if (isNaN(item.amount)) {
            errors.push(`${dayName}: Amount is NaN`);
        } else if (item.amount < 0) {
            errors.push(`${dayName}: Amount cannot be negative`);
        } else if (item.amount === 0) {
            warnings.push(`${dayName}: Amount is zero`);
        } else if (item.amount > 100000000) {
            warnings.push(`${dayName}: Amount seems unusually high (>${formatSalesAmount(100000000)})`);
        }

        // Validate isCurrentWeek flag
        if (typeof item.isCurrentWeek !== 'boolean') {
            errors.push(`${dayName}: isCurrentWeek must be a boolean`);
        }

        // Validate dayName
        if (typeof item.dayName !== 'string' || item.dayName.trim() === '') {
            errors.push(`${dayName}: dayName must be a non-empty string`);
        }

        // Validate weekday sequence based on starting day format
        const expectedDay = item.date?.getDay();
        let expectedDayIndex: number;

        if (firstDayOfWeek === 0) {
            // Sunday-Saturday format: Sunday=0, Monday=1, ..., Saturday=6
            expectedDayIndex = index;
        } else {
            // Monday-Sunday format: Monday=1, Tuesday=2, ..., Saturday=6, Sunday=0
            expectedDayIndex = index === 6 ? 0 : index + 1;
        }

        if (expectedDay && expectedDay !== expectedDayIndex) {
            errors.push(`${dayName}: Date day of week doesn't match expected position (expected ${expectedDayIndex}, got ${expectedDay})`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'weekly-sales-data-validation',
            itemCount: salesData.length,
        },
    };
}

/**
 * Validates date range for work week selection requirements.
 * Ensures the date range meets the weekly component's display requirements.
 *
 * @function validateWeekDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ValidationResult} Validation result with specific week date range errors
 *
 * @example
 * const range = { from: monday, to: friday };
 * const result = validateWeekDateRange(range);
 * if (result.isValid) {
 *   // Safe to display weekly sales comparison
 * }
 */
export function validateWeekDateRange(dateRange: DateRange | undefined): ValidationResult {
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

        // Validate work week requirement
        if (dateRange.from && dateRange.to && dateRange.from instanceof Date && dateRange.to instanceof Date) {
            if (!isWorkWeekSelected(dateRange)) {
                errors.push('Date range must represent exactly one complete week (7 consecutive days) for weekly sales comparison');
            }

            if (dateRange.from > now) {
                warnings.push('Selected week is in the future');
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'week-date-range-validation',
        },
    };
}

/**
 * Transforms API weekly chart data to weekly summary data for display.
 * Calculates the sum of all 7 days for each week and formats date ranges.
 *
 * @function transformApiDataToWeeklySummary
 * @param {any} apiData - Weekly chart data from API with range.actual, range.last, range.two_last
 * @returns {WeeklySummaryData[]} Array of 3 weekly summary objects
 *
 * @example
 * const apiResponse = {
 *   range: {
 *     actual: { "2025-08-25": 4337259.37, "2025-08-26": 6074341.28, ... },
 *     last: { "2025-08-18": 4313279.54, "2025-08-19": 6238484.82, ... },
 *     two_last: { "2025-08-11": 4239247.1, "2025-08-12": 6191199.47, ... }
 *   }
 * };
 * const summaryData = transformApiDataToWeeklySummary(apiResponse);
 */
export function transformApiDataToWeeklySummary(apiData: any): WeeklySummaryData[] {
    if (!apiData) {
        return [];
    }

    // Handle both processed chart data and raw API data
    let rangeData;
    if (apiData.data && apiData.data.range) {
        // Full API response with nested data structure
        rangeData = apiData.data.range;
    } else if (apiData.range) {
        // Direct range data format
        rangeData = apiData.range;
    } else if (apiData.dailyData) {
        // Processed chart data - we need to extract the raw data
        return [];
    } else {
        return [];
    }

    const { actual, last, two_last } = rangeData;

    const summaries: WeeklySummaryData[] = [];

    // Helper function to process a single week's data
    const processWeekData = (weekData: Record<string, number>, weekLabel: string): WeeklySummaryData | null => {
        if (!weekData || Object.keys(weekData).length === 0) {
            return null;
        }

        try {
            // Extract dates and sort them
            const dates = Object.keys(weekData).sort();
            if (dates.length === 0) {
                return null;
            }

            // Use local date parsing to avoid timezone issues
            const startDate = new Date(dates[0] + 'T12:00:00');
            const endDate = new Date(dates[dates.length - 1] + 'T12:00:00');

            // Calculate total amount
            const totalAmount = Object.values(weekData).reduce((sum, amount) => sum + (amount || 0), 0);

            // Format date range label (DD-MM al DD-MM-YY)
            const dateRangeLabel = formatWeekDateRange(startDate, endDate);

            return {
                startDate,
                endDate,
                totalAmount,
                dateRangeLabel,
                weekLabel,
            };
        } catch (error) {
            console.error(`Error processing week ${weekLabel}:`, error);
            return null;
        }
    };

    // Process each week in order (actual, last, two_last)
    const actualWeek = processWeekData(actual, 'actual');
    if (actualWeek) summaries.push(actualWeek);

    const lastWeek = processWeekData(last, 'last');
    if (lastWeek) summaries.push(lastWeek);

    const twoLastWeek = processWeekData(two_last, 'two_last');
    if (twoLastWeek) summaries.push(twoLastWeek);

    return summaries;
}

/**
 * Formats a date range for weekly summary cards.
 * Creates a Spanish-formatted date range string in DD-MM al DD-MM-YY format.
 *
 * @function formatWeekDateRange
 * @param {Date} startDate - Start date of the week
 * @param {Date} endDate - End date of the week
 * @returns {string} Formatted date range string
 *
 * @example
 * const start = new Date('2025-08-25');
 * const end = new Date('2025-08-31');
 * const formatted = formatWeekDateRange(start, end);
 * // Returns: "25-08 al 31-08-25"
 */
export function formatWeekDateRange(startDate: Date, endDate: Date): string {
    // Format start date as DD-MM
    const startDD = startDate.getDate().toString().padStart(2, '0');
    const startMM = (startDate.getMonth() + 1).toString().padStart(2, '0');

    // Format end date as DD-MM-YY
    const endDD = endDate.getDate().toString().padStart(2, '0');
    const endMM = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endYY = endDate.getFullYear().toString().slice(-2);

    return `${startDD}-${startMM} al ${endDD}-${endMM}-${endYY}`;
}

/**
 * Formats a sales amount as Mexican peso currency for display.
 * Uses the same formatting as other components for consistency.
 *
 * @function formatWeeklySalesAmount
 * @param {number} amount - The sales amount to format
 * @returns {string} Formatted currency string
 *
 * @example
 * formatWeeklySalesAmount(59522507.81); // "$59,522,507.81"
 */
export function formatWeeklySalesAmount(amount: number): string {
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
