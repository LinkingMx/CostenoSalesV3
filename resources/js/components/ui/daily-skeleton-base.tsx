import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as React from 'react';

/**
 * Unified skeleton animation component for daily loading states
 *
 * Provides a consistent shimmer animation effect across all daily components
 * using the theme system colors and proper accessibility.
 */
export const SkeletonShimmer = React.memo(({
    className,
    ...props
}: React.ComponentProps<"div">) => (
    <div
        className={cn(
            "animate-pulse rounded-md",
            // Enhanced visibility with primary color gradients and borders
            "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
            "border border-primary/15",
            // Theme-aware enhancements
            "dark:from-primary/25 dark:via-primary/15 dark:to-primary/25",
            "dark:border-primary/20",
            // Shimmer animation for better loading indication
            "bg-[length:200%_100%] animate-shimmer",
            className
        )}
        {...props}
    />
));

SkeletonShimmer.displayName = "SkeletonShimmer";

/**
 * Unified base card structure for daily component skeletons
 *
 * Provides consistent card styling that matches the actual components
 * with proper theme integration and Spanish accessibility labels.
 */
export const DailySkeletonBase = React.memo(({
    children,
    className,
    "aria-label": ariaLabel = "Cargando datos diarios...",
    ...props
}: React.ComponentProps<typeof Card> & {
    "aria-label"?: string;
}) => (
    <Card
        className={cn("w-full border-border animate-in fade-in-50 duration-300", className)}
        aria-label={ariaLabel}
        role="status"
        aria-live="polite"
        {...props}
    >
        <CardContent className="px-4 py-3">
            {children}
        </CardContent>
    </Card>
));

DailySkeletonBase.displayName = "DailySkeletonBase";

/**
 * Standard header skeleton for daily components
 *
 * Consistent header structure with icon, title, and subtitle placeholders
 * that matches the actual component headers.
 */
export const DailySkeletonHeader = React.memo(() => (
    <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Icon skeleton */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <SkeletonShimmer className="h-4 w-4 rounded" />
            </div>
            {/* Title and subtitle */}
            <div className="flex flex-col gap-1">
                <SkeletonShimmer className="h-5 w-48 rounded" />
                <SkeletonShimmer className="h-4 w-32 rounded" />
            </div>
        </div>
        {/* Optional refresh button skeleton */}
        <SkeletonShimmer className="h-8 w-8 rounded" />
    </div>
));

DailySkeletonHeader.displayName = "DailySkeletonHeader";

/**
 * Standard loading text for Spanish localization
 */
export const SKELETON_LOADING_TEXTS = {
    branches: "Cargando ventas por sucursal...",
    comparison: "Cargando comparación de ventas...",
    chart: "Cargando gráfico de ventas...",
    data: "Cargando datos diarios...",
} as const;

/**
 * Utility function to create staggered animation delays for multiple skeleton items
 *
 * @param index - The index of the skeleton item (0-based)
 * @param delayMs - Base delay in milliseconds (default: 100ms)
 * @returns CSS style object with animation delay
 */
export const getStaggeredDelay = (index: number, delayMs: number = 100) => ({
    animationDelay: `${index * delayMs}ms`,
    animationFillMode: 'both' as const,
});

/**
 * Type definitions for skeleton variants
 */
export type SkeletonVariant = 'branches' | 'comparison' | 'chart';

/**
 * Configuration for skeleton animations
 */
export const SKELETON_CONFIG = {
    /** Default animation duration for skeleton items */
    animationDuration: 'duration-1000',
    /** Stagger delay between multiple items */
    staggerDelayMs: 150,
    /** Minimum loading duration for UX consistency */
    minLoadingDurationMs: 3000,
} as const;