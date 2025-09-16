/**
 * Date and month formatting utilities for monthly sales components.
 * Provides Spanish localization and consistent date formatting across the monthly sales system.
 */

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
 * Returns the first letter of the Spanish month name (e.g., "S" for Septiembre).
 * Used for creating circular indicators in the monthly comparison cards.
 *
 * @function getMonthLetter
 * @param {Date} date - The date to get the month letter from
 * @returns {string} Single letter representing the month
 *
 * @example
 * const september = new Date('2025-09-01');
 * const january = new Date('2025-01-01');
 *
 * getMonthLetter(september); // "S" (Septiembre)
 * getMonthLetter(january);   // "E" (Enero)
 */
export function getMonthLetter(date: Date): string {
    const monthLetters = {
        0: 'E', // Enero
        1: 'F', // Febrero
        2: 'M', // Marzo
        3: 'A', // Abril
        4: 'M', // Mayo
        5: 'J', // Junio
        6: 'J', // Julio
        7: 'A', // Agosto
        8: 'S', // Septiembre
        9: 'O', // Octubre
        10: 'N', // Noviembre
        11: 'D', // Diciembre
    };

    const month = date.getMonth();
    return monthLetters[month as keyof typeof monthLetters];
}

/**
 * Gets the full Spanish month name from a date.
 * Returns the complete month name in Spanish (e.g., "Septiembre", "Enero").
 * Used for displaying month names in the UI components.
 *
 * @function getMonthName
 * @param {Date} date - The date to get the month name from
 * @returns {string} Full Spanish month name
 *
 * @example
 * const september = new Date('2025-09-01');
 * const january = new Date('2025-01-01');
 *
 * getMonthName(september); // "Septiembre"
 * getMonthName(january);   // "Enero"
 */
export function getMonthName(date: Date): string {
    const monthNames = {
        0: 'Enero',
        1: 'Febrero',
        2: 'Marzo',
        3: 'Abril',
        4: 'Mayo',
        5: 'Junio',
        6: 'Julio',
        7: 'Agosto',
        8: 'Septiembre',
        9: 'Octubre',
        10: 'Noviembre',
        11: 'Diciembre',
    };

    const month = date.getMonth();
    return monthNames[month as keyof typeof monthNames];
}