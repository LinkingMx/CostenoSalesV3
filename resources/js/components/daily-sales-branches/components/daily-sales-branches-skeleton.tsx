import { DailySkeletonBase, getStaggeredDelay, SkeletonShimmer, SKELETON_LOADING_TEXTS } from '@/components/ui/daily-skeleton-base';
import { Building } from 'lucide-react';
import * as React from 'react';

/**
 * DailySalesBranchesSkeleton - Modern loading skeleton for daily sales branches component
 *
 * Provides a visually consistent loading state that matches the actual component structure.
 * Features staggered animations, theme integration, and proper Spanish accessibility.
 *
 * @component
 * @param {Object} props - Configuration props
 * @param {number} [props.itemCount=3] - Number of branch skeleton items to display
 * @returns {JSX.Element} Skeleton loading state for daily sales branches
 *
 * @description Features:
 * - Matches exact structure of daily-sales-branches component
 * - Staggered animation delays for smooth visual experience
 * - Proper header with icon and title placeholders
 * - Branch cards with avatar, name, and sales amount placeholders
 * - Theme-consistent styling with shimmer animations
 * - Spanish accessibility labels for screen readers
 * - Responsive design that adapts to component layout
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <DailySalesBranchesSkeleton itemCount={4} />;
 * }
 * ```
 */
export const DailySalesBranchesSkeleton = React.memo(({
    itemCount = 3,
}: {
    itemCount?: number;
}) => {
    // Generate array of items for rendering skeleton branches
    const skeletonItems = React.useMemo(
        () => Array.from({ length: itemCount }, (_, index) => ({ id: index })),
        [itemCount]
    );

    return (
        <DailySkeletonBase aria-label={SKELETON_LOADING_TEXTS.branches}>
            {/* Real Header Component - No skeleton loading */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Building className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base leading-none font-semibold tracking-tight text-foreground">
                            Ventas por sucursal (Por día)
                        </h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Ventas diarias por sucursal detalladas
                        </p>
                    </div>
                </div>
            </div>

            {/* Branch Cards Section */}
            <div className="space-y-3" role="region" aria-label="Cargando detalles de sucursales">
                {skeletonItems.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg border border-border bg-card p-3 animate-in fade-in-50"
                        style={getStaggeredDelay(item.id, 150)}
                    >
                        {/* Branch header row - collapsed state */}
                        <div className="flex items-center justify-between">
                            {/* Left side - Avatar and name */}
                            <div className="flex items-center gap-2.5">
                                {/* Branch avatar circle */}
                                <SkeletonShimmer className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5" />
                                {/* Branch name */}
                                <SkeletonShimmer className="h-4 w-32 rounded" />
                            </div>

                            {/* Right side - Sales data */}
                            <div className="text-right space-y-1">
                                {/* Sales amount */}
                                <SkeletonShimmer className="mb-1 h-5 w-20 rounded" />
                                {/* Percentage change */}
                                <SkeletonShimmer className="h-4 w-12 rounded" />
                            </div>
                        </div>

                        {/* Optional: Subtle hint of collapsible content for first item */}
                        {item.id === 0 && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                                <div className="grid grid-cols-2 gap-3 opacity-40">
                                    <div className="space-y-2">
                                        <SkeletonShimmer className="h-3 w-20 rounded" />
                                        <SkeletonShimmer className="h-4 w-16 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <SkeletonShimmer className="h-3 w-24 rounded" />
                                        <SkeletonShimmer className="h-4 w-18 rounded" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Loading indicator text */}
            <div className="mt-3 flex items-center justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <SkeletonShimmer className="h-4 w-4 rounded" />
                    <span className="opacity-70">Cargando ventas por sucursal...</span>
                </div>
            </div>
        </DailySkeletonBase>
    );
});

DailySalesBranchesSkeleton.displayName = 'DailySalesBranchesSkeleton';

export default DailySalesBranchesSkeleton;