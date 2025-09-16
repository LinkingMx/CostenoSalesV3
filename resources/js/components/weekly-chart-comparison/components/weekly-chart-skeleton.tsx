/**
 * Weekly Chart Loading Skeleton
 * Loading state component for weekly chart comparison
 */

import { Card, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { WeeklyChartHeader } from './weekly-chart-header';

interface WeeklyChartSkeletonProps {
    /** Chart height in pixels */
    height?: number;
}

/**
 * WeeklyChartSkeleton - Loading skeleton for the weekly chart comparison component.
 *
 * Displays animated placeholder content while data is being fetched.
 * Mimics the structure of the actual weekly chart for smooth loading experience.
 *
 * @component
 * @param {WeeklyChartSkeletonProps} props - Component configuration props
 * @returns {JSX.Element} Loading skeleton interface
 *
 * @description Key features:
 * - Animated skeleton matching chart structure
 * - Multi-line chart skeleton with 3 lines
 * - Shows real header immediately for better UX
 * - Day labels skeleton for x-axis
 * - Grid lines and legend skeleton
 * - Consistent styling with actual chart component
 * - Smooth pulse animations for better UX
 *
 * @example
 * ```tsx
 * // Basic usage
 * <WeeklyChartSkeleton />
 *
 * // Custom height
 * <WeeklyChartSkeleton height={350} />
 * ```
 */
export const WeeklyChartSkeleton: React.FC<WeeklyChartSkeletonProps> = ({ height = 300 }) => {
    // Generate random heights for chart points to simulate data variation
    const generateRandomHeight = () => Math.random() * 60 + 20;

    // 7 days for weekly chart
    const dayCount = 7;

    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-3">
                {/* Real header - shown immediately for better UX */}
                <WeeklyChartHeader />

                {/* Chart container skeleton */}
                <div
                    className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-b from-card to-card/80"
                    style={{ height }}
                >
                    {/* Legend skeleton */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="h-3 w-3 animate-pulse rounded-full border border-primary/20 bg-gradient-to-r from-primary/25 to-primary/15" />
                                <div className="h-3 w-16 animate-pulse rounded border border-primary/15 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
                            </div>
                        ))}
                    </div>

                    {/* Chart area */}
                    <div className="absolute inset-0 p-4">
                        {/* Grid lines skeleton */}
                        <div className="absolute inset-4 flex flex-col justify-between opacity-40">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-px animate-pulse bg-primary/15" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>

                        {/* Chart lines skeleton */}
                        <div className="relative flex h-full items-end justify-between px-8 pb-8">
                            {/* Data points for 7 days */}
                            {Array.from({ length: dayCount }).map((_, dayIndex) => (
                                <div key={dayIndex} className="relative flex flex-col items-center">
                                    {/* Three week lines simulation */}
                                    <div className="absolute bottom-6 space-y-1">
                                        {[1, 2, 3].map((lineIndex) => (
                                            <div
                                                key={lineIndex}
                                                className="h-2 w-2 animate-pulse rounded-full border border-primary/25 bg-gradient-to-r from-primary/30 to-primary/20"
                                                style={{
                                                    animationDelay: `${(dayIndex * 3 + lineIndex) * 50}ms`,
                                                    transform: `translateY(-${generateRandomHeight()}px)`,
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Day label skeleton */}
                                    <div className="h-3 w-8 animate-pulse rounded border border-primary/15 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
                                </div>
                            ))}
                        </div>

                        {/* Connecting lines skeleton */}
                        <svg
                            className="pointer-events-none absolute inset-0 h-full w-full"
                            style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}
                        >
                            {/* Three wavy lines to simulate chart lines */}
                            {[1, 2, 3].map((lineIndex) => (
                                <path
                                    key={lineIndex}
                                    d={`M ${20 + lineIndex * 5} ${height * 0.6}
                      Q ${height * 0.3} ${height * 0.4}
                      ${height * 0.5} ${height * 0.5}
                      Q ${height * 0.7} ${height * 0.3}
                      ${height * 0.9} ${height * 0.4}`}
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="2"
                                    fill="none"
                                    className="animate-pulse opacity-20"
                                    style={{ animationDelay: `${lineIndex * 200}ms` }}
                                />
                            ))}
                        </svg>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WeeklyChartSkeleton;
