import { cn } from '@/lib/utils';
import { Coffee, UtensilsCrossed, Wine } from 'lucide-react';
import type { CategoryCardProps } from '../types';
import { formatMexicanPesos, formatPercentage } from '../utils';

// Icon mapping
const iconMap = {
    UtensilsCrossed,
    Coffee,
    Wine,
};

/**
 * Individual category card component for displaying sales data by product type
 */
export function CategoryCard({ data, isLoading = false, className }: CategoryCardProps) {
    const IconComponent = iconMap[data.icon as keyof typeof iconMap] || UtensilsCrossed;
    const formattedMoney = formatMexicanPesos(data.money);
    const formattedPercentage = formatPercentage(data.percentage);

    if (isLoading) {
        return (
            <div className={cn('flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3', className)}>
                {/* Left side skeleton */}
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    </div>
                </div>

                {/* Right side skeleton */}
                <div className="flex flex-col items-end gap-0.5 text-right">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-lg border border-border bg-card px-3 py-3 transition-all duration-200 hover:bg-card/80',
                className,
            )}
            role="article"
            aria-label={`${data.name}: ${formattedMoney} (${formattedPercentage})`}
        >
            {/* Left side - Icon and category name */}
            <div className="flex items-center gap-2.5">
                {/* Category icon */}
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm"
                    aria-hidden="true"
                >
                    <IconComponent className="h-4 w-4" />
                </div>

                {/* Category name */}
                <div className="flex flex-col">
                    <span className="text-sm leading-tight font-medium text-foreground">{data.name}</span>
                </div>
            </div>

            {/* Right side - Sales information */}
            <div className="flex flex-col items-end gap-0.5 text-right">
                <div className="text-lg font-bold text-foreground tabular-nums">{formattedMoney}</div>
                <div className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{formattedPercentage}</div>
            </div>
        </div>
    );
}
