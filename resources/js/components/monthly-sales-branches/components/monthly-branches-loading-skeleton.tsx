import { Card, CardContent } from '@/components/ui/card';
import { MonthlySalesBranchesHeader } from './monthly-sales-branches-header';

/**
 * Loading skeleton component for monthly branches data with filters.
 * Displays placeholder content while API data is being fetched.
 *
 * @component
 * @returns {JSX.Element} Loading skeleton matching the structure of MonthlySalesBranches with filters
 *
 * @description This skeleton:
 * - Shows the same header as the actual component
 * - Includes filter controls skeleton (region and brand dropdowns)
 * - Shows summary card skeleton with minimalist design
 * - Displays shimmer placeholders for ~6 branches (visible area)
 * - Matches the exact spacing and structure of filtered component
 * - Uses consistent styling with other loading states in the app
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <MonthlyBranchesLoadingSkeleton />
 * ) : (
 *   <MonthlySalesBranches data={branchesData} />
 * )}
 * ```
 */
export function MonthlyBranchesLoadingSkeleton() {
    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header section - same as actual component */}
                <MonthlySalesBranchesHeader />

                {/* Filters Section Skeleton */}
                <div className="flex items-center gap-2 px-4 py-3">
                    {/* Filter icon */}
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    {/* Region filter dropdown skeleton */}
                    <div className="h-9 w-[160px] rounded-md bg-muted animate-pulse" />
                    {/* Brand filter dropdown skeleton */}
                    <div className="h-9 w-[160px] rounded-md bg-muted animate-pulse" />
                </div>

                {/* Summary Card Skeleton - Minimalist Design */}
                <div className="bg-card border border-border px-4 py-3 mb-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        {/* Total general skeleton */}
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
                            <div>
                                <div className="h-4 w-16 rounded mb-1 bg-muted animate-pulse" />
                                <div className="h-6 w-24 rounded bg-muted animate-pulse" />
                            </div>
                        </div>
                        {/* Sucursales counter skeleton */}
                        <div className="text-right">
                            <div className="h-4 w-16 rounded mb-1 bg-muted animate-pulse" />
                            <div className="h-5 w-8 rounded bg-muted animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Loading skeleton branches */}
                <div className="space-y-2" role="region" aria-label="Cargando datos de sucursales mensuales">
                    {/* Generate 6 skeleton items (typical visible area) */}
                    {Array.from({ length: 6 }).map((_, index) => (
                        <BranchSkeletonItem key={index} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Individual skeleton item matching BranchCollapsibleItem structure.
 * Provides shimmer placeholders for the collapsed state content.
 */
function BranchSkeletonItem() {
    return (
        <div className="animate-pulse rounded-lg border border-border bg-muted">
            <div className="flex items-center justify-between px-3 py-3">
                {/* Left side - Avatar and branch name skeleton */}
                <div className="flex items-center gap-2.5">
                    {/* Avatar skeleton */}
                    <div className="h-9 w-9 rounded-full bg-muted-foreground/20" />

                    {/* Branch name skeleton */}
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-32 rounded bg-muted-foreground/20" />
                    </div>
                </div>

                {/* Right side - Amount and badge skeleton */}
                <div className="flex flex-col items-end gap-1 text-right">
                    {/* Amount skeleton */}
                    <div className="h-5 w-24 rounded bg-muted-foreground/20" />

                    {/* Badge skeleton */}
                    <div className="h-4 w-12 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Chevron skeleton */}
                <div className="ml-2 flex-shrink-0">
                    <div className="h-4 w-4 rounded bg-muted-foreground/20" />
                </div>
            </div>
        </div>
    );
}
