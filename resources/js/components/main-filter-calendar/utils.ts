import type { DateRange, PeriodGroup, PeriodKey, PeriodOption } from './types';

/**
 * Spanish month names for localized date formatting.
 * Used throughout the component for displaying dates in Spanish.
 *
 * @constant {string[]} SPANISH_MONTHS
 * @description Array of month names in Spanish, indexed 0-11 (enero = 0, diciembre = 11)
 *
 * @example
 * const currentMonthName = SPANISH_MONTHS[new Date().getMonth()];
 * // Returns 'enero' for January, 'febrero' for February, etc.
 */
export const SPANISH_MONTHS = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
];

/**
 * Spanish day abbreviations following Monday-first convention.
 * Used for calendar grid headers, matching European/Latin American standards.
 *
 * @constant {string[]} SPANISH_DAYS
 * @description Week starts with Monday (lu) and ends with Sunday (do)
 * Abbreviations: lunes, martes, miércoles, jueves, viernes, sábado, domingo
 *
 * @example
 * // Generates calendar headers: lu ma mi ju vi sá do
 * SPANISH_DAYS.map(day => <th>{day}</th>)
 */
export const SPANISH_DAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

/**
 * Period options organized in groups
 */
export const PERIOD_GROUPS: PeriodGroup[] = [
    {
        label: 'Diarios',
        options: [
            { value: 'today', label: 'Hoy' },
            { value: 'yesterday', label: 'Ayer' },
        ],
    },
    {
        label: 'Semanales',
        options: [
            { value: 'thisWeek', label: 'Esta semana' },
            { value: 'lastWeek', label: 'Semana pasada' },
        ],
    },
    {
        label: 'Mensuales',
        options: [
            { value: 'thisMonth', label: 'Este mes' },
            { value: 'lastMonth', label: 'Mes pasado' },
        ],
    },
];

/**
 * Custom date selection option for manual calendar interaction.
 * Appears at the top of the period selector dropdown.
 *
 * @constant {PeriodOption} CUSTOM_OPTION
 * @description Allows users to manually select dates via calendar interface
 *
 * @example
 * // User selects this to enable manual date picking
 * if (selectedPeriod === CUSTOM_OPTION.value) {
 *   // Show calendar for manual date selection
 * }
 */
export const CUSTOM_OPTION: PeriodOption = {
    value: 'custom',
    label: 'Fechas personalizadas',
};

/**
 * Calculates a DateRange object based on predefined period keys.
 * All calculations are performed relative to the current date and follow
 * Monday-first week convention used in many Spanish-speaking countries.
 *
 * @function getDateRange
 * @param {PeriodKey} period - The predefined period to calculate
 * @returns {DateRange} Object with from and to Date objects
 *
 * @description Period calculations:
 * - 'today': Current date (from === to)
 * - 'yesterday': Previous day (from === to)
 * - 'thisWeek': Monday to Sunday of current week
 * - 'lastWeek': Monday to Sunday of previous week
 * - 'thisMonth': First to last day of current month
 * - 'lastMonth': First to last day of previous month
 * - 'custom': Defaults to today (should be overridden by user selection)
 *
 * @example
 * const thisWeekRange = getDateRange('thisWeek');
 * // Returns: { from: Monday, to: Sunday } of current week
 *
 * const todayRange = getDateRange('today');
 * // Returns: { from: today, to: today }
 */
export const getDateRange = (period: PeriodKey): DateRange => {
    const today = new Date();
    // Create yesterday by subtracting one day from today
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    switch (period) {
        case 'today':
            return { from: new Date(today), to: new Date(today) };

        case 'yesterday':
            return { from: new Date(yesterday), to: new Date(yesterday) };

        case 'thisWeek': {
            const startOfWeek = new Date(today);
            const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            // Calculate days to subtract to get to Monday
            // If today is Sunday (0), go back 6 days; otherwise go back (day - 1) days
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
            startOfWeek.setDate(diff);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get Sunday
            return { from: startOfWeek, to: endOfWeek };
        }

        case 'lastWeek': {
            const startOfWeek = new Date(today);
            const day = today.getDay();
            // Same calculation as thisWeek, but subtract additional 7 days for previous week
            const diff = today.getDate() - day + (day === 0 ? -6 : 1) - 7; // Previous Monday
            startOfWeek.setDate(diff);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Previous Sunday
            return { from: startOfWeek, to: endOfWeek };
        }

        case 'thisMonth': {
            // First day of current month
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            // Last day of current month (day 0 of next month)
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            return { from: startOfMonth, to: endOfMonth };
        }

        case 'lastMonth': {
            // First day of previous month
            const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            // Last day of previous month (day 0 of current month)
            const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            return { from: startOfMonth, to: endOfMonth };
        }

        default:
            // Fallback for any unhandled period keys (including 'custom')
            return { from: today, to: today };
    }
};

/**
 * Formats a single date for display using Spanish localization.
 * Returns format: "15 ene, 2025" (day + 3-letter month + year)
 *
 * @function formatDate
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in Spanish
 *
 * @example
 * formatDate(new Date('2025-01-15'))
 * // Returns: "15 ene, 2025"
 *
 * formatDate(new Date('2025-12-25'))
 * // Returns: "25 dic, 2025"
 */
export const formatDate = (date: Date): string => {
    // Validate input is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('formatDate: Invalid date provided:', date);
        return 'Fecha inválida';
    }

    try {
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();

        // Validate month index is within expected range
        if (monthIndex < 0 || monthIndex >= SPANISH_MONTHS.length) {
            console.warn('formatDate: Invalid month index:', monthIndex);
            return 'Fecha inválida';
        }

        const month = SPANISH_MONTHS[monthIndex];
        // Use first 3 characters of month name (enero -> ene, febrero -> feb)
        return `${day} ${month.slice(0, 3)}, ${year}`;
    } catch (error) {
        console.error('formatDate: Error formatting date:', error);
        return 'Error de formato';
    }
};

/**
 * Formats a date range for display, handling single dates and ranges.
 * Returns different formats based on the range completeness.
 *
 * @function formatDateRange
 * @param {DateRange | undefined} range - The date range to format
 * @returns {string} Formatted range string or empty string if invalid
 *
 * @description Return formats:
 * - Empty range: "" (empty string)
 * - Single date: "15 ene, 2025 al 15 ene, 2025" (shows as range)
 * - Same day range: "15 ene, 2025 al 15 ene, 2025" (explicit same-day range)
 * - Date range: "15 ene, 2025 al 20 ene, 2025"
 *
 * @example
 * formatDateRange({ from: new Date('2025-01-15') })
 * // Returns: "15 ene, 2025 al 15 ene, 2025"
 *
 * formatDateRange({ from: new Date('2025-01-15'), to: new Date('2025-01-20') })
 * // Returns: "15 ene, 2025 al 20 ene, 2025"
 *
 * formatDateRange(undefined)
 * // Returns: ""
 */
export const formatDateRange = (range: DateRange | undefined): string => {
    if (!range?.from) return '';

    const fromStr = formatDate(range.from);

    // Always show as range format, even for same-day selections
    if (!range.to) {
        // If only 'from' date exists, show as same-day range
        return `${fromStr} al ${fromStr}`;
    }

    const toStr = formatDate(range.to);
    return `${fromStr} al ${toStr}`;
};

/**
 * Calculates the number of days in a given month and year.
 * Accounts for leap years and varying month lengths.
 *
 * @function getDaysInMonth
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @returns {number} Number of days in the specified month (28-31)
 *
 * @example
 * getDaysInMonth(1, 2024) // February 2024 (leap year)
 * // Returns: 29
 *
 * getDaysInMonth(1, 2025) // February 2025 (non-leap year)
 * // Returns: 28
 *
 * getDaysInMonth(0, 2025) // January 2025
 * // Returns: 31
 */
export const getDaysInMonth = (month: number, year: number): number => {
    // Validate input parameters
    if (!Number.isInteger(month) || month < 0 || month > 11) {
        console.warn('getDaysInMonth: Invalid month:', month);
        return 31; // Safe fallback
    }

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        console.warn('getDaysInMonth: Invalid year:', year);
        return 31; // Safe fallback
    }

    try {
        // Create date for day 0 of next month, which gives last day of current month
        return new Date(year, month + 1, 0).getDate();
    } catch (error) {
        console.error('getDaysInMonth: Error calculating days:', error);
        return 31; // Safe fallback
    }
};

/**
 * Gets the first day of the week for a given month, converted to Monday-first format.
 * Used for proper calendar grid alignment with Monday as the first column.
 *
 * @function getFirstDayOfMonth
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @returns {number} Day of week (0 = Monday, 6 = Sunday)
 *
 * @description Conversion logic:
 * - JavaScript Date.getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 * - Our format: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
 *
 * @example
 * getFirstDayOfMonth(0, 2025) // January 1, 2025 is a Wednesday
 * // Returns: 2 (Wednesday in Monday-first format)
 *
 * getFirstDayOfMonth(1, 2025) // February 1, 2025 is a Saturday
 * // Returns: 5 (Saturday in Monday-first format)
 */
export const getFirstDayOfMonth = (month: number, year: number): number => {
    // Validate input parameters
    if (!Number.isInteger(month) || month < 0 || month > 11) {
        console.warn('getFirstDayOfMonth: Invalid month:', month);
        return 0; // Fallback to Monday
    }

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        console.warn('getFirstDayOfMonth: Invalid year:', year);
        return 0; // Fallback to Monday
    }

    try {
        const firstDay = new Date(year, month, 1).getDay();
        // Convert JavaScript's Sunday-first (0-6) to Monday-first (0-6)
        // Sunday (0) becomes 6, Monday-Saturday (1-6) become 0-5
        return firstDay === 0 ? 6 : firstDay - 1;
    } catch (error) {
        console.error('getFirstDayOfMonth: Error getting first day:', error);
        return 0; // Fallback to Monday
    }
};

/**
 * Determines if a specific day matches today's date.
 * Used for highlighting the current date in the calendar.
 *
 * @function isToday
 * @param {number} day - Day of month (1-31)
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @returns {boolean} True if the specified date is today
 *
 * @example
 * // If today is January 15, 2025:
 * isToday(15, 0, 2025) // Returns: true
 * isToday(16, 0, 2025) // Returns: false
 * isToday(15, 1, 2025) // Returns: false (different month)
 */
export const isToday = (day: number, month: number, year: number): boolean => {
    // Validate input parameters
    if (!Number.isInteger(day) || day < 1 || day > 31) {
        return false;
    }

    if (!Number.isInteger(month) || month < 0 || month > 11) {
        return false;
    }

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        return false;
    }

    try {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    } catch (error) {
        console.error('isToday: Error checking if today:', error);
        return false;
    }
};

/**
 * Determines if a day is part of the currently selected date range.
 * Handles both single date selections and complete date ranges.
 *
 * @function isSelected
 * @param {number} day - Day of month (1-31)
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @param {DateRange | undefined} tempRange - Current date range selection
 * @returns {boolean} True if the day is part of the selected range
 *
 * @description Selection logic:
 * - No range: false
 * - Pending range (only 'from'): true only for exact match with 'from'
 * - Complete range: true if day is between 'from' and 'to' (inclusive)
 *
 * @example
 * // Single date selection
 * const pendingRange = { from: new Date(2025, 0, 15) };
 * isSelected(15, 0, 2025, pendingRange) // Returns: true
 * isSelected(16, 0, 2025, pendingRange) // Returns: false
 *
 * // Date range selection
 * const completeRange = { from: new Date(2025, 0, 15), to: new Date(2025, 0, 20) };
 * isSelected(17, 0, 2025, completeRange) // Returns: true (within range)
 */
export const isSelected = (day: number, month: number, year: number, tempRange: DateRange | undefined): boolean => {
    if (!tempRange?.from) return false;
    const dayDate = new Date(year, month, day);

    if (!tempRange.to) {
        // Only 'from' date selected (pending range) - exact match only
        return dayDate.getTime() === tempRange.from.getTime();
    }

    // Complete date range selection (including same day range)
    return dayDate.getTime() >= tempRange.from.getTime() && dayDate.getTime() <= tempRange.to.getTime();
};

/**
 * Determines if a day is the start date of the selected range.
 * Used for applying special styling to the range start.
 *
 * @function isRangeStart
 * @param {number} day - Day of month (1-31)
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @param {DateRange | undefined} tempRange - Current date range selection
 * @returns {boolean} True if the day is the range start date
 *
 * @example
 * const range = { from: new Date(2025, 0, 15), to: new Date(2025, 0, 20) };
 * isRangeStart(15, 0, 2025, range) // Returns: true
 * isRangeStart(20, 0, 2025, range) // Returns: false
 * isRangeStart(17, 0, 2025, range) // Returns: false
 */
export const isRangeStart = (day: number, month: number, year: number, tempRange: DateRange | undefined): boolean => {
    if (!tempRange?.from) return false;
    const dayDate = new Date(year, month, day);
    return dayDate.getTime() === tempRange.from.getTime();
};

/**
 * Determines if a day is the end date of the selected range.
 * Used for applying special styling to the range end.
 *
 * @function isRangeEnd
 * @param {number} day - Day of month (1-31)
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @param {DateRange | undefined} tempRange - Current date range selection
 * @returns {boolean} True if the day is the range end date
 *
 * @example
 * const range = { from: new Date(2025, 0, 15), to: new Date(2025, 0, 20) };
 * isRangeEnd(20, 0, 2025, range) // Returns: true
 * isRangeEnd(15, 0, 2025, range) // Returns: false
 * isRangeEnd(17, 0, 2025, range) // Returns: false
 */
export const isRangeEnd = (day: number, month: number, year: number, tempRange: DateRange | undefined): boolean => {
    if (!tempRange?.to || !tempRange.from) return false;
    const dayDate = new Date(year, month, day);
    return dayDate.getTime() === tempRange.to.getTime();
};

/**
 * Determines if a day is within the middle of a date range (excluding endpoints).
 * Used for styling days that are between the start and end dates.
 *
 * @function isInRange
 * @param {number} day - Day of month (1-31)
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @param {DateRange | undefined} tempRange - Current date range selection
 * @returns {boolean} True if the day is between start and end dates (exclusive)
 *
 * @description This function returns true only for days that are:
 * - After the 'from' date (exclusive)
 * - Before the 'to' date (exclusive)
 * - Part of a complete date range (both 'from' and 'to' exist)
 *
 * @example
 * const range = { from: new Date(2025, 0, 15), to: new Date(2025, 0, 20) };
 * isInRange(17, 0, 2025, range) // Returns: true (between 15 and 20)
 * isInRange(15, 0, 2025, range) // Returns: false (start date)
 * isInRange(20, 0, 2025, range) // Returns: false (end date)
 * isInRange(14, 0, 2025, range) // Returns: false (before range)
 */
export const isInRange = (day: number, month: number, year: number, tempRange: DateRange | undefined): boolean => {
    if (!tempRange?.from || !tempRange?.to) return false;
    const dayDate = new Date(year, month, day);
    const dayTime = dayDate.getTime();
    const fromTime = tempRange.from.getTime();
    const toTime = tempRange.to.getTime();

    // Check if day is between start and end (exclusive of endpoints)
    return dayTime > fromTime && dayTime < toTime;
};

/**
 * Determines if a day is a pending start date (first click, waiting for end date).
 * Used for special visual feedback when user has selected a start date but not an end date.
 *
 * @function isPendingStart
 * @param {number} day - Day of month (1-31)
 * @param {number} month - Zero-based month (0 = January, 11 = December)
 * @param {number} year - Four-digit year
 * @param {DateRange | undefined} tempRange - Current date range selection
 * @returns {boolean} True if the day is a pending start date
 *
 * @description A pending start occurs when:
 * - The range has a 'from' date
 * - The range does NOT have a 'to' date
 * - The specified day matches the 'from' date
 *
 * @example
 * // User clicked on Jan 15 but hasn't selected end date yet
 * const pendingRange = { from: new Date(2025, 0, 15) };
 * isPendingStart(15, 0, 2025, pendingRange) // Returns: true
 *
 * // Complete range - no longer pending
 * const completeRange = { from: new Date(2025, 0, 15), to: new Date(2025, 0, 20) };
 * isPendingStart(15, 0, 2025, completeRange) // Returns: false
 */
export const isPendingStart = (day: number, month: number, year: number, tempRange: DateRange | undefined): boolean => {
    // Must have 'from' date but NOT have 'to' date to be pending
    if (!tempRange?.from || tempRange?.to) return false;
    const dayDate = new Date(year, month, day);
    return dayDate.getTime() === tempRange.from.getTime();
};
