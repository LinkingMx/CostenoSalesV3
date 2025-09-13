import * as React from 'react';
import type { SalesCustomCardProps } from '../types';
import { formatSalesAmount, formatCustomDateRange } from '../utils/formatting';
import { calculateCustomRangeSummary } from '../utils/data-generation';

/**
 * SalesCustomCard - Individual card component for displaying custom range sales data.
 * 
 * Renders a card with a circular range indicator, formatted date range, and aggregated sales amounts.
 * Shows total sales and daily average for the custom range period.
 * 
 * @component
 * @param {SalesCustomCardProps} props - Component configuration props
 * @returns {JSX.Element} Styled custom range sales card
 * 
 * @description Features:
 * - Circular indicator with "R" letter for custom range
 * - Formatted date range display ("Del 01 Sep al 15 Sep (15 días)" format)
 * - Currency-formatted total sales amount in Mexican pesos
 * - Daily average calculation and display
 * - Responsive layout matching other comparison components
 * - Accessibility-compliant structure with ARIA labels
 * 
 * @example
 * ```tsx
 * const customData = [
 *   { date: new Date('2025-09-01'), amount: 50000, isInRange: true, dayName: 'Domingo', formattedDate: '01 Sep' },
 *   { date: new Date('2025-09-02'), amount: 75000, isInRange: true, dayName: 'Lunes', formattedDate: '02 Sep' }
 * ];
 * const dateRange = { from: new Date('2025-09-01'), to: new Date('2025-09-02') };
 * 
 * <SalesCustomCard 
 *   data={customData}
 *   dateRange={dateRange}
 *   isHighlighted={false}
 * />
 * ```
 */
export function SalesCustomCard({ 
  data,
  dateRange
}: SalesCustomCardProps) {
  // Calculate summary statistics for the custom range
  const summary = calculateCustomRangeSummary(data);
  
  // Format display data for this custom range
  const rangeIndicator = "R"; // Single letter for circular indicator (R for "Rango")
  const formattedDateRange = formatCustomDateRange(dateRange.from!, dateRange.to!); // "Del 01 Sep al 15 Sep" format
  const formattedTotal = formatSalesAmount(summary.total); // Mexican peso currency format

  return (
    <div
      className="flex items-center justify-between px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all duration-200"
      role="article"
      aria-label={`Ventas del ${formattedDateRange}: Total ${formattedTotal}`}
    >
      {/* Left side - Range indicator and date information */}
      <div className="flex items-center gap-2.5">
        {/* Circular range indicator with "R" for custom range */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm bg-black"
          aria-hidden="true" // Decorative element, screen readers use aria-label on container
        >
          {rangeIndicator} {/* R for Rango personalizado */}
        </div>
        
        {/* Formatted date range display */}
        <div className="flex flex-col">
          <span 
            className="text-sm font-medium leading-tight text-gray-900"
          >
            {formattedDateRange} {/* Format: "Del 01 Sep al 15 Sep" */}
          </span>
        </div>
      </div>

      {/* Right side - Sales amount information */}
      <div className="text-right">
        <div 
          className="text-lg font-bold tabular-nums text-gray-900" // tabular-nums ensures consistent number alignment
        >
          {formattedTotal} {/* Mexican peso formatted total amount */}
        </div>
      </div>
    </div>
  );
}

export default SalesCustomCard;