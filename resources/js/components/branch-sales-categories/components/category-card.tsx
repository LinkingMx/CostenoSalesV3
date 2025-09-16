import * as React from 'react';
import { UtensilsCrossed, Coffee, Wine } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryCardProps } from '../types';
import { formatMexicanPesos, formatPercentage } from '../utils';

// Icon mapping
const iconMap = {
  UtensilsCrossed,
  Coffee,
  Wine
};

/**
 * Individual category card component for displaying sales data by product type
 */
export function CategoryCard({
  data,
  isLoading = false,
  className
}: CategoryCardProps) {
  const IconComponent = iconMap[data.icon as keyof typeof iconMap] || UtensilsCrossed;
  const formattedMoney = formatMexicanPesos(data.money);
  const formattedPercentage = formatPercentage(data.percentage);

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-between px-3 py-3 rounded-lg bg-card border border-border",
        className
      )}>
        {/* Left side skeleton */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Right side skeleton */}
        <div className="text-right flex flex-col items-end gap-0.5">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 bg-card border border-border hover:bg-card/80",
        className
      )}
      role="article"
      aria-label={`${data.name}: ${formattedMoney} (${formattedPercentage})`}
    >
      {/* Left side - Icon and category name */}
      <div className="flex items-center gap-2.5">
        {/* Category icon */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground shadow-sm bg-primary"
          aria-hidden="true"
        >
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Category name */}
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight text-foreground">
            {data.name}
          </span>
        </div>
      </div>

      {/* Right side - Sales information */}
      <div className="text-right flex flex-col items-end gap-0.5">
        <div className="text-lg font-bold tabular-nums text-foreground">
          {formattedMoney}
        </div>
        <div className="text-xs font-medium rounded-full px-2 py-0.5 bg-primary/10 text-primary">
          {formattedPercentage}
        </div>
      </div>
    </div>
  );
}