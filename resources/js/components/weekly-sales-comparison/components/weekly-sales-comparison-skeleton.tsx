import { Card, CardContent } from '@/components/ui/card';
import { WeeklyComparisonHeader } from './weekly-comparison-header';

/**
 * Loading skeleton component for weekly sales comparison data.
 * Displays placeholder content while API data is being fetched.
 *
 * @component
 * @returns {JSX.Element} Loading skeleton matching the structure of WeeklySalesComparison
 *
 * @description This skeleton:
 * - Shows the real header immediately for better UX
 * - Displays shimmer placeholders for 3 weekly summary cards
 * - Matches the exact spacing and structure of WeeklySummaryCard
 * - Uses consistent styling with other loading states in the app
 * - Provides proper accessibility labels for screen readers
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <WeeklySalesComparisonSkeleton />
 * ) : (
 *   <WeeklySalesComparison data={weeklyData} />
 * )}
 * ```
 */
export function WeeklySalesComparisonSkeleton() {
    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Real header - shown immediately for better UX */}
                <WeeklyComparisonHeader />

                {/* Loading skeleton cards */}
                <div className="space-y-2" role="region" aria-label="Cargando comparación de ventas semanales">
                    {/* Generate 3 skeleton items (typical weekly comparison data) */}
                    {Array.from({ length: 3 }).map((_, index) => (
                        <WeeklySummarySkeletonCard key={index} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Individual skeleton card matching WeeklySummaryCard structure.
 * Provides shimmer placeholders for the weekly comparison data.
 */
function WeeklySummarySkeletonCard() {
    return (
        <div className="flex animate-pulse items-center justify-between rounded-lg border border-border bg-card px-3 py-3">
            {/* Left side - Week indicator and date range skeleton */}
            <div className="flex items-center gap-2.5">
                {/* Circular week indicator skeleton */}
                <div className="h-9 w-9 rounded-full bg-muted-foreground/20" />

                {/* Date range skeleton */}
                <div className="flex flex-col">
                    <div className="h-4 w-32 rounded bg-muted-foreground/20" />
                </div>
            </div>

            {/* Right side - Amount skeleton */}
            <div className="text-right">
                <div className="h-5 w-24 rounded bg-muted-foreground/20" />
            </div>
        </div>
    );
}
