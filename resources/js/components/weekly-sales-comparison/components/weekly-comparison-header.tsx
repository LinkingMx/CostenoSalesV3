import * as React from 'react';
import { Calendar } from 'lucide-react';
import type { WeeklyComparisonHeaderProps } from '../types';

/**
 * WeeklyComparisonHeader - Header component for the weekly sales comparison section.
 * 
 * Displays the main title with calendar icon and descriptive subtitle for weekly data.
 * Matches the design pattern with proper spacing and typography for weekly context.
 * 
 * @component
 * @param {WeeklyComparisonHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled weekly header section
 * 
 * @description Features:
 * - Calendar icon with main title for weekly sales
 * - Descriptive subtitle explaining the weekly data scope
 * - Consistent typography and spacing with daily component
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * - Default Spanish localization for Mexican market
 * 
 * @example
 * ```tsx
 * <WeeklyComparisonHeader 
 *   title="Ventas semanales"
 *   subtitle="Semana seleccionada (Lunes - Viernes)"
 * />
 * ```
 */
export function WeeklyComparisonHeader({ 
  title = "Ventas semanales",
  subtitle = "Semana seleccionada (Lunes - Viernes)"
}: WeeklyComparisonHeaderProps) {
  return (
    <header className="mb-3">
      {/* Main title with calendar icon for visual context */}
      <div className="flex items-center gap-2 mb-1">
        <Calendar 
          className="h-5 w-5 text-gray-600" 
          aria-hidden="true" // Decorative icon, not essential for screen readers
        />
        <h2 className="text-lg font-semibold text-gray-900">
          {title} {/* Default: "Ventas semanales" (Weekly Sales) */}
        </h2>
      </div>
      
      {/* Descriptive subtitle explaining the data scope */}
      <p className="text-sm text-gray-600 ml-7"> {/* ml-7 aligns with title text after icon */}
        {subtitle} {/* Default: "Semana seleccionada (Lunes - Viernes)" */}
      </p>
    </header>
  ); // End WeeklyComparisonHeader
}

export default WeeklyComparisonHeader;