/**
 * @fileoverview Branch Filters Component
 *
 * This component provides filtering controls for weekly sales branches using
 * shadcn/ui Select components. Features region and brand filtering with
 * consistent h-9 height matching MainFilterCalendar design.
 *
 * Key features:
 * - Region and brand filtering with dropdown selections
 * - Consistent h-9 height for form element alignment
 * - Theme system integration for light/dark mode
 * - Spanish localization for all UI text
 * - Optimized performance with React.memo
 * - TypeScript strict mode compliance
 *
 * @author CostenoSalesV3 Development Team
 * @since 2025-09-16
 * @version 1.0.0
 */

import { FilterIcon } from 'lucide-react';
import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BranchFilters, FilterOptions } from '../hooks/use-branch-filters';

/**
 * Props interface for BranchFilters component
 * @interface BranchFiltersProps
 * @property {BranchFilters} filters - Current filter state
 * @property {FilterOptions} filterOptions - Available filter options
 * @property {(filters: Partial<BranchFilters>) => void} onFiltersChange - Callback for filter changes
 * @property {boolean} [disabled] - Whether filters are disabled (loading state)
 */
export interface BranchFiltersProps {
    filters: BranchFilters;
    filterOptions: FilterOptions;
    onFiltersChange: (filters: Partial<BranchFilters>) => void;
    disabled?: boolean;
}

/**
 * Branch filters component with region and brand dropdowns
 *
 * This component renders two Select dropdowns for filtering branches by region
 * and brand. It follows the project's design system with theme variables
 * and h-9 height for consistent form alignment.
 *
 * @param {BranchFiltersProps} props - Component props
 * @returns {React.ReactElement} Rendered filter controls
 *
 * @description Design specifications:
 * - Height: h-9 (36px) to match MainFilterCalendar
 * - Spacing: gap-2 between select components
 * - Colors: Theme system variables for light/dark mode
 * - Layout: Horizontal flex layout with responsive behavior
 * - Icon: FilterIcon from lucide-react for visual context
 *
 * @example
 * ```tsx
 * const { filters, filterOptions, setFilters } = useBranchFilters(branches);
 *
 * <BranchFilters
 *   filters={filters}
 *   filterOptions={filterOptions}
 *   onFiltersChange={setFilters}
 *   disabled={isLoading}
 * />
 * ```
 *
 * @performance
 * - Memoized with React.memo for optimal re-rendering
 * - Only re-renders when props change
 * - Optimized for rapid filter interactions
 */
const BranchFilters: React.FC<BranchFiltersProps> = React.memo(({
    filters,
    filterOptions,
    onFiltersChange,
    disabled = false,
}) => {
    /**
     * Handle region filter change
     * @param value - Selected region value
     */
    const handleRegionChange = React.useCallback((value: string) => {
        onFiltersChange({ region: value });
    }, [onFiltersChange]);

    /**
     * Handle brand filter change
     * @param value - Selected brand value
     */
    const handleBrandChange = React.useCallback((value: string) => {
        onFiltersChange({ brand: value });
    }, [onFiltersChange]);

    return (
        <div className="flex items-center gap-2 px-4 py-3">
            {/* Filter icon for visual context */}
            <FilterIcon
                className="h-4 w-4 text-muted-foreground shrink-0"
                aria-hidden="true"
            />

            {/* Region filter dropdown */}
            <Select
                value={filters.region}
                onValueChange={handleRegionChange}
                disabled={disabled}
            >
                <SelectTrigger
                    className="h-9 w-[160px] bg-background border-border text-foreground focus:border-ring focus:ring-ring"
                    aria-label="Filtrar por región"
                >
                    <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent
                    className="bg-popover border-border shadow-lg z-50 max-h-[200px] overflow-y-auto"
                    position="popper"
                    sideOffset={4}
                >
                    {filterOptions.regions.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Brand filter dropdown */}
            <Select
                value={filters.brand}
                onValueChange={handleBrandChange}
                disabled={disabled}
            >
                <SelectTrigger
                    className="h-9 w-[160px] bg-background border-border text-foreground focus:border-ring focus:ring-ring"
                    aria-label="Filtrar por marca"
                >
                    <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent
                    className="bg-popover border-border shadow-lg z-50 max-h-[200px] overflow-y-auto"
                    position="popper"
                    sideOffset={4}
                >
                    {filterOptions.brands.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
});

// Set display name for debugging
BranchFilters.displayName = 'BranchFilters';

export { BranchFilters };