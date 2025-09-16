/**
 * Shared Currency Formatting Utilities
 * Common currency formatting logic used across components
 */

/**
 * Formats a sales amount as a Mexican peso currency string.
 * Consistent formatting used across all sales components.
 *
 * @function formatCurrencyAmount
 * @param {number} amount - The sales amount to format
 * @param {boolean} [abbreviated] - Whether to use abbreviated format (default: false)
 * @returns {string} Formatted currency string
 *
 * @example
 * formatCurrencyAmount(1500000);      // "$1,500,000.00"
 * formatCurrencyAmount(1500000, true); // "$1.5M"
 * formatCurrencyAmount(850000, true);  // "$850K"
 */
export function formatCurrencyAmount(amount: number, abbreviated: boolean = false): string {
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
 * Formats a full Spanish day name with date for tooltips and labels.
 * Returns format like "Lunes, 12 de Septiembre".
 *
 * @function formatFullDayName
 * @param {Date} date - The date to format
 * @returns {string} Full Spanish day name with date
 *
 * @example
 * const date = new Date('2025-09-12');
 * formatFullDayName(date); // "Jueves, 12 de Septiembre"
 */
export function formatFullDayName(date: Date): string {
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}
