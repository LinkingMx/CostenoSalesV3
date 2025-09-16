/**
 * Enhanced Daily Chart Loading Skeleton
 * Modern loading state component for daily chart comparison with improved UX patterns
 */

import { DailySkeletonBase, getStaggeredDelay, SkeletonShimmer, SKELETON_LOADING_TEXTS } from '@/components/ui/daily-skeleton-base';
import { BarChart3 } from 'lucide-react';
import * as React from 'react';

/**
 * Enhanced loading skeleton for the daily chart comparison component.
 * Features modern UX patterns, staggered animations, and theme integration.
 *
 * @param {Object} props - Configuration props
 * @param {number} [props.height=210] - Height of the chart area in pixels
 * @param {number} [props.barCount=4] - Number of animated bars to display
 * @returns {JSX.Element} Enhanced skeleton loading state
 */
export function DailyChartSkeleton({
    height = 210,
    barCount = 4
}: {
    height?: number;
    barCount?: number;
}) {
    // Generate consistent bar heights for better visual stability
    const barHeights = React.useMemo(() =>
        Array.from({ length: barCount }, (_, i) => {
            // Use predictable heights for better UX (no random flickering)
            const baseHeight = 30 + (i * 15);
            return Math.min(80, baseHeight);
        }),
        [barCount]
    );

    return (
        <DailySkeletonBase aria-label={SKELETON_LOADING_TEXTS.chart}>
            {/* Enhanced Header Section */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Icon container with actual icon for continuity */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted animate-enhanced-pulse">
                        <BarChart3 className="h-4 w-4 text-primary opacity-60" />
                    </div>
                    {/* Title and subtitle with improved sizing */}
                    <div className="flex flex-col gap-1">
                        <SkeletonShimmer className="h-5 w-52 rounded" />
                        <SkeletonShimmer className="h-4 w-36 rounded" />
                    </div>
                </div>
            </div>

            {/* Enhanced Chart Container */}
            <div
                className="relative overflow-hidden rounded-lg bg-gradient-to-b from-muted/10 to-muted/20 border border-border/50"
                style={{ height }}
            >
                {/* Background grid pattern */}
                <div className="absolute inset-0">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-30">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonShimmer
                                key={`grid-h-${i}`}
                                className="h-px w-full bg-border/20"
                                style={getStaggeredDelay(i, 50)}
                            />
                        ))}
                    </div>

                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 flex justify-between px-8 opacity-20">
                        {Array.from({ length: barCount }).map((_, i) => (
                            <SkeletonShimmer
                                key={`grid-v-${i}`}
                                className="w-px h-full bg-border/20"
                                style={getStaggeredDelay(i, 75)}
                            />
                        ))}
                    </div>
                </div>

                {/* Enhanced Animated Bars */}
                <div className="absolute inset-0 flex items-end justify-around px-8 pb-6">
                    {barHeights.map((barHeight, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-4"
                            style={{
                                width: '20%',
                                ...getStaggeredDelay(i, 200)
                            }}
                        >
                            {/* Bar with gradient and enhanced styling */}
                            <div
                                className="w-full rounded-t-md bg-gradient-to-t from-primary/30 via-primary/20 to-primary/10 animate-shimmer relative overflow-hidden"
                                style={{ height: `${barHeight}%` }}
                            >
                                {/* Shimmer overlay effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-shimmer" />

                                {/* Highlight bar on selected (first) item */}
                                {i === 0 && (
                                    <div className="absolute inset-0 bg-primary/20 animate-enhanced-pulse" />
                                )}
                            </div>

                            {/* Label placeholder with varied widths */}
                            <SkeletonShimmer
                                className={`h-3 rounded ${i === 0 ? 'w-20' : i === 1 ? 'w-16' : i === 2 ? 'w-18' : 'w-14'}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Chart value indicators on Y-axis */}
                <div className="absolute left-2 top-4 bottom-6 flex flex-col justify-between opacity-40">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonShimmer
                            key={`y-label-${i}`}
                            className="h-3 w-8 rounded text-xs"
                            style={getStaggeredDelay(i, 100)}
                        />
                    ))}
                </div>
            </div>

            {/* Loading progress indicator */}
            <div className="mt-3 flex items-center justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <SkeletonShimmer className="h-4 w-4 rounded animate-spin" />
                    <span className="opacity-70">Generando comparación diaria...</span>
                </div>
            </div>
        </DailySkeletonBase>
    );
}

export default DailyChartSkeleton;
