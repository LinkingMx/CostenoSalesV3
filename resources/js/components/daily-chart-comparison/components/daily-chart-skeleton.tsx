/**
 * Daily Chart Loading Skeleton
 * Loading state component for daily chart comparison
 */

import * as React from 'react';

/**
 * Loading skeleton for the daily chart comparison component.
 * Displays animated placeholder content while data is being fetched.
 */
export function DailyChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div>
            <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div 
        className="relative overflow-hidden bg-muted/20 rounded"
        style={{ height }}
      >
        {/* Animated bars */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 pb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2"
              style={{ width: '20%' }}
            >
              <div
                className="w-full bg-muted rounded-t animate-pulse"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 100}ms`
                }}
              />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Grid lines skeleton */}
        <div className="absolute inset-0 flex flex-col justify-between py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-px bg-border/30"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DailyChartSkeleton;