import type { SalesMonthCardProps } from '../types';
import { formatDateForMonthCard, formatSalesAmount, getMonthLetter } from '../utils';

/**
 * SalesMonthCard - Individual card component for displaying monthly sales data.
 *
 * Renders a card with a circular month indicator, formatted date, and sales amount.
 * The card can be highlighted for current month data and follows the monthly design pattern.
 *
 * @component
 * @param {SalesMonthCardProps} props - Component configuration props
 * @returns {JSX.Element} Styled monthly sales card
 *
 * @description Features:
 * - Circular indicator with month letter (E, F, M, A, etc. for months)
 * - Formatted date display ("Enero - 01/2025" format)
 * - Currency-formatted sales amount in Mexican pesos
 * - Highlight styling for current month data
 * - Responsive layout matching the monthly design pattern
 * - Accessibility-compliant structure with ARIA labels
 *
 * @example
 * ```tsx
 * const salesData = {
 *   date: new Date('2025-09-01'),
 *   amount: 15250533.98,
 *   isCurrentMonth: true,
 *   monthName: 'Septiembre'
 * };
 *
 * <SalesMonthCard
 *   data={salesData}
 *   isHighlighted={salesData.isCurrentMonth}
 * />
 * ```
 */
export function SalesMonthCard({ data }: SalesMonthCardProps) {
    // Extract and format display data for this sales month
    const monthLetter = getMonthLetter(data.date); // Single letter for circular indicator (E, F, M, A, etc.)
    const formattedDate = formatDateForMonthCard(data.date); // "Enero - 01/2025" format
    const formattedAmount = formatSalesAmount(data.amount); // Mexican peso currency format

    return (
        <div
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 transition-all duration-200 hover:bg-muted"
            role="article"
            aria-label={`Ventas del ${formattedDate}: ${formattedAmount}`}
        >
            {/* Left side - Month indicator and date information */}
            <div className="flex items-center gap-2.5">
                {/* Circular month indicator with Spanish month letter */}
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
                    aria-hidden="true" // Decorative element, screen readers use aria-label on container
                >
                    {monthLetter} {/* E, F, M, A, etc. for Enero, Febrero, Marzo, Abril, etc. */}
                </div>

                {/* Formatted date display */}
                <div className="flex flex-col">
                    <span className="text-sm leading-tight font-medium text-foreground">
                        {formattedDate} {/* Format: "Enero - 01/2025" */}
                    </span>
                </div>
            </div>

            {/* Right side - Sales amount information */}
            <div className="text-right">
                <div
                    className="text-lg font-bold text-foreground tabular-nums" // tabular-nums ensures consistent number alignment
                >
                    {formattedAmount} {/* Mexican peso formatted amount */}
                </div>
            </div>
        </div>
    );
}

export default SalesMonthCard;
