import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

/**
 * SalesComparisonSkeleton - Loading skeleton for the daily sales comparison component.
 *
 * Displays a skeleton loader that matches the structure of the actual daily sales
 * comparison component, providing visual feedback during data loading.
 *
 * @component
 * @returns {JSX.Element} Skeleton loader UI matching the daily sales comparison layout
 *
 * @description Features:
 * - Matches the exact layout of the daily sales comparison component
 * - Displays skeleton placeholders for the header and 4 sales cards
 * - Uses consistent spacing and sizing with the actual component
 * - Provides smooth loading animation for better UX
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <SalesComparisonSkeleton />;
 * }
 * ```
 */
export function SalesComparisonSkeleton() {
    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-3">
                {/* Header skeleton */}
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <Skeleton className="mb-1 h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                {/* Sales cards skeleton */}
                <div className="space-y-2">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                            <div className="flex items-center gap-3">
                                {/* Circle indicator skeleton */}
                                <Skeleton className="h-9 w-9 rounded-full" />

                                {/* Date text skeleton */}
                                <Skeleton className="h-4 w-28" />
                            </div>

                            {/* Amount skeleton */}
                            <Skeleton className="h-5 w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default SalesComparisonSkeleton;
