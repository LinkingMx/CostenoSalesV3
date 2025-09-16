/**
 * Currency formatting utilities for monthly sales components.
 * Provides consistent Mexican peso formatting across the monthly sales system.
 */

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