import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

/**
 * CustomSalesComparisonSkeleton - Loading skeleton for the custom sales comparison component.
 *
 * Displays a skeleton loader that matches the structure of the actual custom sales
 * comparison component, providing visual feedback during data loading.
 *
 * @component
 * @returns {JSX.Element} Skeleton loader UI matching the custom sales comparison layout
 *
 * @description Features:
 * - Matches the exact layout of the custom sales comparison component
 * - Displays skeleton placeholders for the header and sales cards
 * - Uses consistent spacing and sizing with the actual component
 * - Provides smooth loading animation for better UX
 *
 * @example
 * ```tsx
 * if (loading) {
 *   return <CustomSalesComparisonSkeleton />;
 * }
 * ```
 */
export function CustomSalesComparisonSkeleton() {
    return (
        <Card className="w-full border-border">
            <CardContent className="px-4 py-3">
                {/* Header skeleton */}
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <Skeleton className="mb-1 h-5 w-52" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                </div>

                {/* Sales data cards skeleton */}
                <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                            <div className="flex items-center gap-3">
                                {/* Date indicator skeleton */}
                                <Skeleton className="h-9 w-9 rounded-full" />

                                {/* Date range text skeleton */}
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>

                            {/* Amount and trend skeleton */}
                            <div className="text-right">
                                <Skeleton className="mb-1 h-5 w-28" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary section skeleton */}
                <div className="mt-4 rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="mb-1 h-4 w-24" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="mb-1 h-6 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default CustomSalesComparisonSkeleton;