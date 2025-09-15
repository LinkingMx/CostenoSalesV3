/**
 * Weekly Chart Loading Skeleton
 * Loading state component for weekly chart comparison
 */

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
 * - Header skeleton with icon and text placeholders
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
export const WeeklyChartSkeleton: React.FC<WeeklyChartSkeletonProps> = ({
  height = 300
}) => {
  // Generate random heights for chart points to simulate data variation
  const generateRandomHeight = () => Math.random() * 60 + 20;

  // 7 days for weekly chart
  const dayCount = 7;

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-36 bg-muted rounded animate-pulse" />
            <div className="h-3 w-52 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Chart container skeleton */}
        <div
          className="relative overflow-hidden bg-muted/10 rounded-lg"
          style={{ height }}
        >
          {/* Legend skeleton */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="absolute inset-0 p-4">
            {/* Grid lines skeleton */}
            <div className="absolute inset-4 flex flex-col justify-between">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-px bg-border/20 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>

            {/* Chart lines skeleton */}
            <div className="relative h-full flex items-end justify-between px-8 pb-8">
              {/* Data points for 7 days */}
              {Array.from({ length: dayCount }).map((_, dayIndex) => (
                <div key={dayIndex} className="relative flex flex-col items-center">
                  {/* Three week lines simulation */}
                  <div className="absolute bottom-6 space-y-1">
                    {[1, 2, 3].map((lineIndex) => (
                      <div
                        key={lineIndex}
                        className="w-2 h-2 bg-muted rounded-full animate-pulse"
                        style={{
                          animationDelay: `${(dayIndex * 3 + lineIndex) * 50}ms`,
                          transform: `translateY(-${generateRandomHeight()}px)`
                        }}
                      />
                    ))}
                  </div>

                  {/* Day label skeleton */}
                  <div className="h-3 w-8 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Connecting lines skeleton */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
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
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-muted opacity-30 animate-pulse"
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