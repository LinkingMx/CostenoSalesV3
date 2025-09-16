import { DailySkeletonBase, getStaggeredDelay, SkeletonShimmer, SKELETON_LOADING_TEXTS } from '@/components/ui/daily-skeleton-base';
import * as React from 'react';
import { SalesComparisonHeader } from './sales-comparison-header';

/**
 * Enhanced SalesComparisonSkeleton - Modern loading skeleton for daily sales comparison component.
 *
 * Displays an enhanced skeleton loader with staggered animations and modern UX patterns
 * that matches the structure of the actual daily sales comparison component.
 *
 * @component
 * @param {Object} props - Configuration props
 * @param {number} [props.cardCount=4] - Number of sales cards to display in skeleton
 * @returns {JSX.Element} Enhanced skeleton loader UI
 *
 * @description Features:
 * - Matches the exact layout of the daily sales comparison component
 * - Enhanced skeleton placeholders with shimmer animations
 * - Staggered loading animations for smooth visual experience
 * - Theme-consistent styling with proper accessibility
 * - Spanish localization for screen readers
 * - Improved visual hierarchy and spacing
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <SalesComparisonSkeleton cardCount={4} />;
 * }
 * ```
 */
export function SalesComparisonSkeleton({
    cardCount = 4
}: {
    cardCount?: number;
}) {
    // Generate sales card data for consistent rendering
    const salesCards = React.useMemo(
        () => Array.from({ length: cardCount }, (_, index) => ({
            id: index,
            isHighlighted: index === 0 // First card (today) should be highlighted
        })),
        [cardCount]
    );

    return (
        <DailySkeletonBase aria-label={SKELETON_LOADING_TEXTS.comparison}>
            {/* Real Header Component - No skeleton loading */}
            <SalesComparisonHeader />

            {/* Enhanced Sales Cards Section */}
            <div className="space-y-2" role="region" aria-label="Cargando comparación de ventas">
                {salesCards.map((card) => (
                    <div
                        key={card.id}
                        className={`
                            flex items-center justify-between rounded-lg border bg-card px-3 py-2
                            animate-in fade-in-50 slide-in-from-left-1
                            ${card.isHighlighted
                                ? 'border-primary/20 bg-gradient-to-r from-primary/5 to-transparent'
                                : 'border-border'
                            }
                        `}
                        style={getStaggeredDelay(card.id, 150)}
                    >
                        {/* Left section - Circle and date */}
                        <div className="flex items-center gap-3">
                            {/* Enhanced circle indicator with gradient */}
                            <div className={`
                                h-9 w-9 rounded-full relative overflow-hidden
                                ${card.isHighlighted
                                    ? 'bg-gradient-to-br from-primary/20 to-primary/10'
                                    : 'bg-muted'
                                }
                            `}>
                                <SkeletonShimmer className="absolute inset-0 rounded-full" />
                                {/* Highlight effect for today's card */}
                                {card.isHighlighted && (
                                    <div className="absolute inset-0 bg-primary/10 animate-enhanced-pulse rounded-full" />
                                )}
                            </div>

                            {/* Date text with varied widths for realism */}
                            <SkeletonShimmer
                                className={`h-4 rounded ${
                                    card.id === 0 ? 'w-20' :
                                    card.id === 1 ? 'w-16' :
                                    card.id === 2 ? 'w-18' : 'w-24'
                                }`}
                            />
                        </div>

                        {/* Right section - Sales amount */}
                        <div className="text-right">
                            {/* Main amount with highlighting for today */}
                            <SkeletonShimmer
                                className={`mb-1 h-5 rounded ${
                                    card.isHighlighted ? 'w-28 bg-primary/20' : 'w-24'
                                }`}
                            />

                            {/* Optional percentage indicator for first few cards */}
                            {card.id < 2 && (
                                <SkeletonShimmer
                                    className="h-3 w-12 rounded opacity-60"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading progress indicator */}
            <div className="mt-3 flex items-center justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <SkeletonShimmer className="h-4 w-4 rounded animate-spin" />
                    <span className="opacity-70">Calculando comparación de ventas...</span>
                </div>
            </div>
        </DailySkeletonBase>
    );
}

export default SalesComparisonSkeleton;
