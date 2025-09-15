/**
 * Monthly Chart Skeleton Loading Component
 * Displays a loading skeleton while monthly chart data is being fetched
 */

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { MonthlyChartSkeletonProps } from '../types';

/**
 * MonthlyChartSkeleton - Loading skeleton for monthly chart comparison
 *
 * Displays animated skeleton placeholders while data is loading
 * Matches the exact layout of the actual chart for smooth transitions
 */
export const MonthlyChartSkeleton = React.memo(function MonthlyChartSkeleton({
  height = 300,
  className = ''
}: MonthlyChartSkeletonProps) {
  return (
    <div className={`w-full rounded-xl bg-card border border-border p-6 ${className}`}>
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="space-y-4" style={{ height }}>
        {/* Simulate chart lines */}
        <div className="flex items-end justify-between h-full px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton
                className="w-1"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                }}
              />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>

        {/* Legend skeleton */}
        <div className="flex justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default MonthlyChartSkeleton;