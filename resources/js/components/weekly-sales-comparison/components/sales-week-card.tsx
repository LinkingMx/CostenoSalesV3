import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SalesWeekCardProps } from '../types';
import { formatSalesAmount, formatDateForWeekCard, getDayLetter } from '../utils';

/**
 * SalesWeekCard - Individual card component for displaying weekly sales data.
 * 
 * Renders a card with a circular day indicator, formatted date, and sales amount.
 * The card can be highlighted for current week data and follows the weekly design pattern.
 * 
 * @component
 * @param {SalesWeekCardProps} props - Component configuration props
 * @returns {JSX.Element} Styled weekly sales card
 * 
 * @description Features:
 * - Circular indicator with day letter (L, M, X, J, V for weekdays)
 * - Formatted date display ("Lun - DD/MM/YYYY" format)
 * - Currency-formatted sales amount in Mexican pesos
 * - Highlight styling for current week data
 * - Responsive layout matching the weekly design pattern
 * - Accessibility-compliant structure with ARIA labels
 * 
 * @example
 * ```tsx
 * const salesData = {
 *   date: new Date('2025-09-15'),
 *   amount: 15250533.98,
 *   isCurrentWeek: true,
 *   dayName: 'Lunes'
 * };
 * 
 * <SalesWeekCard 
 *   data={salesData}
 *   isHighlighted={salesData.isCurrentWeek}
 * />
 * ```
 */
export function SalesWeekCard({ 
  data
}: SalesWeekCardProps) {
  // Extract and format display data for this sales day
  const dayLetter = getDayLetter(data.date); // Single letter for circular indicator (L, M, X, J, V)
  const formattedDate = formatDateForWeekCard(data.date); // "Lun - 15/09/2025" format
  const formattedAmount = formatSalesAmount(data.amount); // Mexican peso currency format

  return (
    <div
      className="flex items-center justify-between px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200"
      role="article"
      aria-label={`Ventas del ${formattedDate}: ${formattedAmount}`}
    >
      {/* Left side - Day indicator and date information */}
      <div className="flex items-center gap-2.5">
        {/* Circular day indicator with Spanish day letter */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm bg-gray-600"
          aria-hidden="true" // Decorative element, screen readers use aria-label on container
        >
          {dayLetter} {/* L, M, X, J, V for Lunes, Martes, Miércoles, Jueves, Viernes */}
        </div>
        
        {/* Formatted date display */}
        <div className="flex flex-col">
          <span 
            className="text-sm font-medium leading-tight text-gray-900"
          >
            {formattedDate} {/* Format: "Lun - 15/09/2025" */}
          </span>
        </div>
      </div>

      {/* Right side - Sales amount information */}
      <div className="text-right">
        <div 
          className="text-lg font-bold tabular-nums text-gray-900" // tabular-nums ensures consistent number alignment
        >
          {formattedAmount} {/* Mexican peso formatted amount */}
        </div>
      </div>
    </div>
  );
}

export default SalesWeekCard;