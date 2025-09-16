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
 * formatSalesAmount(125533.98); // "$125,533.98"
 * formatSalesAmount(2568720.45); // "$2,568,720.45"
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
 * Formats a date for display in the custom sales cards.
 * Returns format like "15 Sep" or "03 Dic" for Spanish localization.
 *
 * @function formatDateForCustomCard
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string with day and abbreviated month
 *
 * @example
 * const date1 = new Date('2025-09-15');
 * const date2 = new Date('2025-12-03');
 *
 * formatDateForCustomCard(date1);  // "15 Sep"
 * formatDateForCustomCard(date2);  // "03 Dic"
 */
export function formatDateForCustomCard(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('es-MX', { month: 'short' });

    return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
}

/**
 * Gets the Spanish day name for a given date.
 * Returns full Spanish day names (Lunes, Martes, etc.).
 *
 * @function getDayName
 * @param {Date} date - The date to get the day name for
 * @returns {string} Full Spanish day name
 *
 * @example
 * const monday = new Date('2025-09-15'); // Monday
 * const friday = new Date('2025-09-19'); // Friday
 *
 * getDayName(monday);    // "Lunes"
 * getDayName(friday);    // "Viernes"
 */
export function getDayName(date: Date): string {
    const dayName = date.toLocaleDateString('es-MX', { weekday: 'long' });
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

/**
 * Formats a date range for display in headers and titles.
 * Returns format like "Del 01 Sep al 15 Sep" for custom ranges.
 *
 * @function formatCustomDateRange
 * @param {Date} startDate - The start date of the range
 * @param {Date} endDate - The end date of the range
 * @returns {string} Formatted date range string
 *
 * @example
 * const start = new Date('2025-09-01');
 * const end = new Date('2025-09-15');
 *
 * formatCustomDateRange(start, end); // "Del 01 Sep al 15 Sep"
 */
export function formatCustomDateRange(startDate: Date, endDate: Date): string {
    const startFormatted = formatDateForCustomCard(startDate);
    const endFormatted = formatDateForCustomCard(endDate);

    return `Del ${startFormatted} al ${endFormatted}`;
}

/**
 * Formats a percentage value for display.
 * Returns format like "+15.5%" or "-8.2%" with appropriate sign.
 *
 * @function formatPercentage
 * @param {number} percentage - The percentage value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string with sign
 *
 * @example
 * formatPercentage(15.456);  // "+15.5%"
 * formatPercentage(-8.234);  // "-8.2%"
 * formatPercentage(0);       // "0.0%"
 */
export function formatPercentage(percentage: number, decimals: number = 1): string {
    const formatted = percentage.toFixed(decimals);
    const sign = percentage > 0 ? '+' : percentage < 0 ? '' : '';
    return `${sign}${formatted}%`;
}

/**
 * Formats a number for compact display (K, M, B notation).
 * Useful for displaying large numbers in limited space.
 *
 * @function formatCompactNumber
 * @param {number} num - The number to format
 * @returns {string} Formatted compact number string
 *
 * @example
 * formatCompactNumber(1234);      // "1.2K"
 * formatCompactNumber(1234567);   // "1.2M"
 * formatCompactNumber(1234567890); // "1.2B"
 */
export function formatCompactNumber(num: number): string {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}
