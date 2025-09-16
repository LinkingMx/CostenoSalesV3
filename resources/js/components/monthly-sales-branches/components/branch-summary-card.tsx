/**
 * @fileoverview Branch Summary Card Component
 *
 * This component displays aggregated metrics from filtered branch data in a
 * compact card format. Shows total sales and branch count with responsive
 * design and Spanish localization for monthly sales branches.
 *
 * Key features:
 * - Aggregated metrics from filtered branch data
 * - Mexican peso currency formatting with proper locale
 * - Responsive layout adapting to screen sizes
 * - Theme system integration for light/dark mode
 * - Performance optimized with React.memo
 *
 * @author CostenoSalesV3 Development Team
 * @since 2025-09-16
 * @version 1.0.0
 */

import { BarChart3Icon } from 'lucide-react';
import * as React from 'react';
import { formatCurrency } from '../utils';
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
 * Branch summary card component displaying filtered metrics
 *
 * This component shows key metrics from filtered branch data including total sales
 * and branch count. It provides visual context for the effectiveness of current filters.
 *
 * @param {BranchSummaryCardProps} props - Component props
 * @returns {React.ReactElement} Rendered summary card
 *
 * @description Design specifications:
 * - Background: Uses theme variables for light/dark mode compatibility
 * - Layout: Horizontal flex with responsive stacking on mobile
 * - Typography: Balanced font weights with clear hierarchy
 * - Icons: BarChart3 from lucide-react with primary color accent
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
            <div className="bg-card border border-border px-4 py-3 mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm font-medium">
                        {hasActiveFilters
                            ? 'No hay sucursales que coincidan con los filtros'
                            : 'No hay datos de sucursales disponibles'
                        }
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border px-4 py-3 mb-3 rounded-lg">
            <div className="flex items-center justify-between">
                {/* Total general con diseño minimalista */}
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">
                            Total {hasActiveFilters ? 'filtrado' : 'general'}
                        </div>
                        <div className="text-xl font-bold text-foreground tabular-nums">
                            {formatCurrency(summary.totalSales)}
                        </div>
                    </div>
                </div>

                {/* Solo contador de sucursales */}
                <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground">
                        Sucursales
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                        {summary.branchCount}
                    </div>
                </div>
            </div>
        </div>
    );
});

// Set display name for debugging
BranchSummaryCard.displayName = 'BranchSummaryCard';

export { BranchSummaryCard };