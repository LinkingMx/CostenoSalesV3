import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SalesDayCardProps } from '../types';
import { formatSalesAmount, formatDateForCard, getDayLetter } from '../utils';

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
export function SalesDayCard({ 
  data, 
  isHighlighted = false 
}: SalesDayCardProps) {
  const dayLetter = getDayLetter(data.date, data.isToday);
  const formattedDate = formatDateForCard(data.date, data.isToday);
  const formattedAmount = formatSalesAmount(data.amount);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200",
        isHighlighted 
          ? "bg-amber-50 border border-amber-200 shadow-sm" 
          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
      )}
      role="article"
      aria-label={`Ventas del ${formattedDate}: ${formattedAmount}`}
    >
      {/* Left side - Day indicator and date */}
      <div className="flex items-center gap-2.5">
        {/* Circular day indicator */}
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm",
            isHighlighted 
              ? "bg-amber-600" 
              : "bg-gray-600"
          )}
          aria-hidden="true"
        >
          {dayLetter}
        </div>
        
        {/* Date display */}
        <div className="flex flex-col">
          <span 
            className={cn(
              "text-sm font-medium leading-tight",
              isHighlighted 
                ? "text-amber-900" 
                : "text-gray-900"
            )}
          >
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Right side - Sales information */}
      <div className="text-right">
        <div 
          className={cn(
            "text-lg font-bold tabular-nums",
            isHighlighted 
              ? "text-amber-900" 
              : "text-gray-900"
          )}
        >
          {formattedAmount}
        </div>
      </div>
    </div>
  );
}

export default SalesDayCard;