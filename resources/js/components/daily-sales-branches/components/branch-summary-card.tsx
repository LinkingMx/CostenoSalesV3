/**
 * @fileoverview Branch Summary Card Component
 *
 * This component displays aggregated metrics from filtered branch data in a
 * compact card format. Shows total sales, average percentage, and branch count
 * with responsive design and Spanish localization.
 *
 * Key features:
 * - Aggregated metrics from filtered branch data
 * - Mexican peso currency formatting with proper locale
 * - Percentage growth indicators with visual styling
 * - Responsive layout adapting to screen sizes
 * - Gray color scheme matching project theme
 * - Performance optimized with React.memo
 *
 * @author CostenoSalesV3 Development Team
 * @since 2025-09-16
 * @version 1.0.0
 */

import { BarChart3Icon, TrendingUpIcon } from 'lucide-react';
import * as React from 'react';
import { formatCurrency, formatPercentage } from '../utils';
import type { FilteredSummary } from '../hooks/use-branch-filters';

/**
 * Props interface for BranchSummaryCard component
 * @interface BranchSummaryCardProps
 * @property {FilteredSummary} summary - Aggregated metrics from filtered data
 * @property {boolean} [hasActiveFilters] - Whether any filters are currently applied
 */
export interface BranchSummaryCardProps {
    summary: FilteredSummary;
    hasActiveFilters?: boolean;
}

/**
 * Format large numbers with compact notation for better readability
 * @param value - Number to format
 * @returns Formatted string with K/M suffixes for thousands/millions
 */
const formatCompactNumber = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

/**
 * Branch summary card component displaying filtered metrics
 *
 * This component shows key metrics from filtered branch data including total sales,
 * average percentage growth, and branch count. It provides visual context for the
 * effectiveness of current filters.
 *
 * @param {BranchSummaryCardProps} props - Component props
 * @returns {React.ReactElement} Rendered summary card
 *
 * @description Design specifications:
 * - Background: Light gray (bg-gray-50) with subtle border
 * - Layout: Horizontal flex with responsive stacking on mobile
 * - Typography: Balanced font weights with clear hierarchy
 * - Icons: BarChart3 and TrendingUp from lucide-react
 * - Spacing: Consistent px-4 py-3 padding matching filter controls
 *
 * @example
 * ```tsx
 * const { summary, hasActiveFilters } = useBranchFilters(branches);
 *
 * <BranchSummaryCard
 *   summary={summary}
 *   hasActiveFilters={hasActiveFilters}
 * />
 * ```
 *
 * @performance
 * - Memoized with React.memo for optimal re-rendering
 * - Only re-renders when summary data changes
 * - Efficient formatting calculations
 */
const BranchSummaryCard: React.FC<BranchSummaryCardProps> = React.memo(({
    summary,
    hasActiveFilters = false,
}) => {
    // Early return for empty data
    if (summary.branchCount === 0) {
        return (
            <div className=\"bg-gray-50 border border-gray-200 px-4 py-3\">
                <div className=\"flex items-center gap-2 text-gray-500\">
                    <BarChart3Icon className=\"h-4 w-4\" aria-hidden=\"true\" />
                    <span className=\"text-sm font-medium\">
                        {hasActiveFilters
                            ? 'No hay sucursales que coincidan con los filtros'
                            : 'No hay datos de sucursales disponibles'
                        }
                    </span>
                </div>
            </div>
        );
    }

    // Calculate percentage color and icon based on growth
    const isPositiveGrowth = summary.averagePercentage >= 0;
    const percentageColor = isPositiveGrowth
        ? 'text-emerald-600'
        : 'text-red-500';

    return (
        <div className=\"bg-gray-50 border border-gray-200 px-4 py-3\">
            <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3\">
                {/* Primary metric: Total sales */}
                <div className=\"flex items-center gap-2\">
                    <BarChart3Icon
                        className=\"h-4 w-4 text-gray-500 shrink-0\"
                        aria-hidden=\"true\"
                    />
                    <div className=\"min-w-0 flex-1\">
                        <div className=\"text-sm font-medium text-gray-700\">
                            Total {hasActiveFilters ? 'filtrado' : 'general'}
                        </div>
                        <div className=\"text-lg font-semibold text-gray-900\">
                            {formatCurrency(summary.totalSales)}
                        </div>
                    </div>
                </div>

                {/* Secondary metrics: Growth and count */}
                <div className=\"flex items-center gap-4 text-sm\">
                    {/* Average percentage growth */}
                    <div className=\"flex items-center gap-1\">
                        <TrendingUpIcon
                            className={`h-3 w-3 shrink-0 ${percentageColor}`}
                            aria-hidden=\"true\"
                        />
                        <span className=\"text-gray-600 font-medium\">
                            Promedio:
                        </span>
                        <span className={`font-semibold ${percentageColor}`}>
                            {isPositiveGrowth ? '+' : ''}
                            {formatPercentage(summary.averagePercentage)}
                        </span>
                    </div>

                    {/* Branch count */}
                    <div className=\"text-gray-600\">
                        <span className=\"font-medium\">Sucursales:</span>
                        <span className=\"ml-1 font-semibold text-gray-900\">
                            {summary.branchCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Additional metrics row for detailed view */}
            {summary.branchCount > 0 && (
                <div className=\"mt-2 pt-2 border-t border-gray-200\">
                    <div className=\"flex items-center justify-between text-xs text-gray-500\">
                        <span>
                            Cuentas abiertas: {formatCurrency(summary.totalOpenAccounts)}
                        </span>
                        <span>
                            Ventas cerradas: {formatCurrency(summary.totalClosedSales)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

// Set display name for debugging
BranchSummaryCard.displayName = 'BranchSummaryCard';

export { BranchSummaryCard };