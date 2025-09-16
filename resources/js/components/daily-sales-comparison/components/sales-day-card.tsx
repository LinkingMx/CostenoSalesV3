import { cn } from '@/lib/utils';
import * as React from 'react';
import { logger } from '../lib/logger';
import type { SalesDayCardProps } from '../types';
import { formatDateForCard, formatSalesAmount, getDayLetter } from '../utils';

/**
 * SalesDayCard - Individual card component for displaying daily sales data.
 *
 * Renders a card with a circular day indicator, formatted date, and sales amount.
 * The card can be highlighted for today's data and follows the design from the mockup.
 *
 * @component
 * @param {SalesDayCardProps} props - Component configuration props
 * @returns {JSX.Element} Styled sales day card
 *
 * @description Features:
 * - Circular indicator with day letter (H for today, first letter of day name for others)
 * - Formatted date display ("Hoy - DD/MM/YYYY" or "Day - DD/MM/YYYY")
 * - Currency-formatted sales amount
 * - Highlight styling for today's data
 * - Responsive layout matching the provided design
 *
 * @example
 * ```tsx
 * const salesData = {
 *   date: new Date('2025-09-11'),
 *   amount: 250533.98,
 *   isToday: true
 * };
 *
 * <SalesDayCard
 *   data={salesData}
 *   isHighlighted={salesData.isToday}
 * />
 * ```
 */
export function SalesDayCard({ data, isHighlighted = false }: SalesDayCardProps) {
    const dayLetter = getDayLetter(data.date, data.isToday);
    const formattedDate = formatDateForCard(data.date, data.isToday);
    const formattedAmount = formatSalesAmount(data.amount);

    // Debug logging - using proper useEffect instead of useMemo side effects
    React.useEffect(() => {
        logger.debug('SalesDayCard rendered', {
            dateString: data.date.toLocaleDateString('es-ES'),
            formattedDate,
            dayLetter,
            amount: data.amount,
            isToday: data.isToday,
        });
    }, [data.date, data.amount, data.isToday, formattedDate, dayLetter]);

    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 transition-all duration-200',
                isHighlighted ? 'shadow-sm' : 'hover:bg-card/80',
            )}
            role="article"
            aria-label={`Ventas del ${formattedDate}: ${formattedAmount}`}
        >
            {/* Left side - Day indicator and date */}
            <div className="flex items-center gap-2.5">
                {/* Circular day indicator */}
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
                    aria-hidden="true"
                >
                    {dayLetter}
                </div>

                {/* Date display */}
                <div className="flex flex-col">
                    <span className="text-sm leading-tight font-medium text-foreground">{formattedDate}</span>
                </div>
            </div>

            {/* Right side - Sales information */}
            <div className="text-right">
                <div className="text-lg font-bold text-foreground tabular-nums">{formattedAmount}</div>
            </div>
        </div>
    );
}

export default SalesDayCard;
