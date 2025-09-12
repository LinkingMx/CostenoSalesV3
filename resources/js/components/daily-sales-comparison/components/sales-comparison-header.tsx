import * as React from 'react';
import { Calendar } from 'lucide-react';
import type { SalesComparisonHeaderProps } from '../types';

/**
 * SalesComparisonHeader - Header component for the daily sales comparison section.
 * 
 * Displays the main title with calendar icon and descriptive subtitle.
 * Matches the design from the provided mockup with proper spacing and typography.
 * 
 * @component
 * @param {SalesComparisonHeaderProps} props - Component configuration props
 * @returns {JSX.Element} Styled header section
 * 
 * @description Features:
 * - Calendar icon with main title
 * - Descriptive subtitle explaining the data shown
 * - Consistent typography and spacing
 * - Semantic HTML structure for accessibility
 * - Optional customizable title and subtitle text
 * 
 * @example
 * ```tsx
 * <SalesComparisonHeader 
 *   title="Análisis de ventas (Diarias)"
 *   subtitle="Día filtrado + 3 días anteriores"
 * />
 * ```
 */
export function SalesComparisonHeader({ 
  title = "Análisis de ventas (Diarias)",
  subtitle = "Día filtrado + 3 días anteriores"
}: SalesComparisonHeaderProps) {
  return (
    <header className="mb-3">
      {/* Main title with calendar icon */}
      <div className="flex items-center gap-2 mb-1">
        <Calendar 
          className="h-5 w-5 text-gray-600" 
          aria-hidden="true"
        />
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>
      
      {/* Subtitle description */}
      <p className="text-sm text-gray-600 ml-7">
        {subtitle}
      </p>
    </header>
  );
}

export default SalesComparisonHeader;