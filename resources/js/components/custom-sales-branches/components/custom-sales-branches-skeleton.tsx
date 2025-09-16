import { Card, CardContent } from '@/components/ui/card';
import { CustomSalesBranchesHeader } from './custom-sales-branches-header';

/**
 * Loading skeleton component for custom sales branches data.
 * Displays placeholder content while API data is being fetched.
 *
 * @component
 * @returns {JSX.Element} Loading skeleton matching the structure of CustomSalesBranches
 *
 * @description This skeleton:
 * - Shows the same header as the actual component
 * - Displays shimmer placeholders for ~6 branches (visible area)
 * - Matches the exact spacing and structure of BranchCustomCollapsibleItem
 * - Uses consistent styling with other loading states in the app
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <CustomSalesBranchesSkeleton />
 * ) : (
 *   <CustomSalesBranches data={branchesData} />
 * )}
 * ```
 */
export function CustomSalesBranchesSkeleton() {
    return (
        <Card className="w-full">
            <CardContent className="px-4 py-3">
                {/* Header section - same as actual component */}
                <CustomSalesBranchesHeader />

                {/* Loading skeleton branches */}
                <div className="space-y-2" role="region" aria-label="Cargando datos de sucursales personalizadas">
                    {/* Generate 6 skeleton items (typical visible area) */}
                    {Array.from({ length: 6 }).map((_, index) => (
                        <BranchCustomSkeletonItem key={index} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Individual skeleton item matching BranchCustomCollapsibleItem structure.
 * Provides shimmer placeholders for the collapsed state content.
 */
function BranchCustomSkeletonItem() {
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

                {/* Right side - Amount and trend skeleton */}
                <div className="flex flex-col items-end gap-1 text-right">
                    {/* Amount skeleton */}
                    <div className="h-5 w-24 rounded bg-muted-foreground/20" />

                    {/* Trend percentage skeleton */}
                    <div className="h-4 w-16 rounded bg-muted-foreground/20" />
                </div>

                {/* Chevron skeleton */}
                <div className="ml-2 flex-shrink-0">
                    <div className="h-4 w-4 rounded bg-muted-foreground/20" />
                </div>
            </div>
        </div>
    );
}

export default CustomSalesBranchesSkeleton;