/**
 * Monthly Chart Skeleton Loading Component
 * Displays a loading skeleton while monthly chart data is being fetched
 */

import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';
import { MonthlyChartHeader } from './monthly-chart-header';
import type { MonthlyChartSkeletonProps } from '../types';

/**
 * MonthlyChartSkeleton - Loading skeleton for monthly chart comparison
 *
 * Displays animated skeleton placeholders while data is loading
 * Matches the exact layout of the actual chart for smooth transitions
 */
export const MonthlyChartSkeleton = React.memo(function MonthlyChartSkeleton({ height = 300, className = '' }: MonthlyChartSkeletonProps) {
    return (
        <div className={`w-full rounded-xl border border-border bg-card p-6 ${className}`}>
            {/* Real header - shows immediately for better UX */}
            <div className="mb-6">
                <MonthlyChartHeader
                    title="Gráfica de ventas (Mensuales)"
                    subtitle="Totales mensuales en gráfico de barras"
                />
            </div>

            {/* Chart skeleton - simulates bar chart */}
            <div className="space-y-4" style={{ height }}>
                {/* Simulate 3 monthly bars */}
                <div className="flex h-full items-end justify-center gap-8 px-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 flex-1 max-w-[120px]">
                            <div
                                className="w-full animate-pulse rounded-t-md border border-primary/20 bg-gradient-to-t from-primary/40 via-primary/25 to-primary/15"
                                style={{
                                    height: `${60 + i * 15}%`, // Progressive heights for visual variety
                                }}
                            />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ))}
                </div>

                {/* Legend skeleton for 3 months */}
                <div className="flex justify-center gap-6 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-pulse rounded border border-primary/20 bg-gradient-to-r from-primary/25 to-primary/15" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-pulse rounded border border-primary/20 bg-gradient-to-r from-primary/25 to-primary/15" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-pulse rounded border border-primary/20 bg-gradient-to-r from-primary/25 to-primary/15" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default MonthlyChartSkeleton;
