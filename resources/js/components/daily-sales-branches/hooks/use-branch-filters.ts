/**
 * @fileoverview Hook for branch filtering functionality
 *
 * This hook manages the filtering state and logic for daily sales branches,
 * providing client-side filtering by region and brand for optimal performance.
 *
 * Key features:
 * - Client-side filtering with useMemo optimization
 * - Unique options extraction from branch data
 * - Filter state management with TypeScript safety
 * - Performance optimized with dependency tracking
 * - Spanish localization support for UI elements
 *
 * @author CostenoSalesV3 Development Team
 * @since 2025-09-16
 * @version 1.0.0
 */

import * as React from 'react';
import type { BranchSalesData } from '../types';

/**
 * Filter state interface for branch filtering
 * @interface BranchFilters
 * @property {string} region - Selected region filter ('all' for no filter)
 * @property {string} brand - Selected brand filter ('all' for no filter)
 */
export interface BranchFilters {
    region: string;
    brand: string;
}

/**
 * Filter options interface for dropdown selections
 * @interface FilterOptions
 * @property {Array<{value: string, label: string}>} regions - Available region options
 * @property {Array<{value: string, label: string}>} brands - Available brand options
 */
export interface FilterOptions {
    regions: Array<{ value: string; label: string }>;
    brands: Array<{ value: string; label: string }>;
}

/**
 * Summary metrics for filtered branch data
 * @interface FilteredSummary
 * @property {number} totalSales - Sum of all filtered branch sales
 * @property {number} averagePercentage - Average growth percentage across filtered branches
 * @property {number} branchCount - Number of branches after filtering
 * @property {number} totalOpenAccounts - Sum of open accounts from filtered branches
 * @property {number} totalClosedSales - Sum of closed sales from filtered branches
 */
export interface FilteredSummary {
    totalSales: number;
    averagePercentage: number;
    branchCount: number;
    totalOpenAccounts: number;
    totalClosedSales: number;
}

/**
 * Return interface for the useBranchFilters hook
 * @interface UseBranchFiltersReturn
 * @property {BranchFilters} filters - Current filter state
 * @property {(filters: Partial<BranchFilters>) => void} setFilters - Function to update filters
 * @property {BranchSalesData[]} filteredBranches - Branches after applying current filters
 * @property {FilterOptions} filterOptions - Available filter options extracted from data
 * @property {FilteredSummary} summary - Aggregated metrics from filtered data
 * @property {() => void} resetFilters - Function to reset all filters to 'all'
 * @property {boolean} hasActiveFilters - Whether any filters are currently applied
 */
export interface UseBranchFiltersReturn {
    filters: BranchFilters;
    setFilters: (filters: Partial<BranchFilters>) => void;
    filteredBranches: BranchSalesData[];
    filterOptions: FilterOptions;
    summary: FilteredSummary;
    resetFilters: () => void;
    hasActiveFilters: boolean;
}

/**
 * Extract unique filter options from branch data
 * @param branches - Array of branch sales data
 * @returns FilterOptions with regions and brands
 */
const extractFilterOptions = (branches: BranchSalesData[]): FilterOptions => {
    // Extract unique regions (excluding empty strings)
    const regionSet = new Set<string>();
    branches.forEach((branch) => {
        if (branch.location && branch.location.trim()) {
            regionSet.add(branch.location.trim());
        }
    });

    // Extract unique brands (excluding empty strings)
    const brandSet = new Set<string>();
    branches.forEach((branch) => {
        if (branch.brand && branch.brand.trim()) {
            brandSet.add(branch.brand.trim());
        }
    });

    // Convert to sorted options arrays with 'Región' and 'Marca' as first option
    const regions = [
        { value: 'all', label: 'Región' },
        ...Array.from(regionSet)
            .sort()
            .map((region) => ({ value: region, label: region })),
    ];

    const brands = [
        { value: 'all', label: 'Marca' },
        ...Array.from(brandSet)
            .sort()
            .map((brand) => ({ value: brand, label: brand })),
    ];

    return { regions, brands };
};

/**
 * Filter branches based on current filter state
 * @param branches - Array of branch sales data
 * @param filters - Current filter state
 * @returns Filtered array of branches
 */
const filterBranches = (branches: BranchSalesData[], filters: BranchFilters): BranchSalesData[] => {
    return branches.filter((branch) => {
        // Region filter
        const regionMatch =
            filters.region === 'all' ||
            !filters.region ||
            (branch.location && branch.location.trim() === filters.region);

        // Brand filter
        const brandMatch =
            filters.brand === 'all' ||
            !filters.brand ||
            (branch.brand && branch.brand.trim() === filters.brand);

        return regionMatch && brandMatch;
    });
};

/**
 * Calculate summary metrics from filtered branches
 * @param branches - Filtered array of branch sales data
 * @returns FilteredSummary with aggregated metrics
 */
const calculateSummary = (branches: BranchSalesData[]): FilteredSummary => {
    if (branches.length === 0) {
        return {
            totalSales: 0,
            averagePercentage: 0,
            branchCount: 0,
            totalOpenAccounts: 0,
            totalClosedSales: 0,
        };
    }

    const totalSales = branches.reduce((sum, branch) => sum + branch.totalSales, 0);
    const totalOpenAccounts = branches.reduce((sum, branch) => sum + branch.openAccounts, 0);
    const totalClosedSales = branches.reduce((sum, branch) => sum + branch.closedSales, 0);

    // Calculate average percentage (weighted by sales volume for more meaningful average)
    const totalWeightedPercentage = branches.reduce(
        (sum, branch) => sum + branch.percentage * branch.totalSales,
        0,
    );
    const averagePercentage = totalSales > 0 ? totalWeightedPercentage / totalSales : 0;

    return {
        totalSales,
        averagePercentage,
        branchCount: branches.length,
        totalOpenAccounts,
        totalClosedSales,
    };
};

/**
 * Custom hook for managing branch filters and filtering logic
 *
 * This hook provides comprehensive filtering functionality for daily sales branches,
 * including state management, option extraction, and performance optimization.
 *
 * @param {BranchSalesData[]} branches - Array of branch sales data to filter
 * @returns {UseBranchFiltersReturn} Complete filtering state and functions
 *
 * @description Features:
 * - Maintains filter state for region and brand
 * - Automatically extracts unique filter options from data
 * - Applies filters with optimized client-side filtering
 * - Calculates summary metrics from filtered results
 * - Provides reset functionality and active filter detection
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   setFilters,
 *   filteredBranches,
 *   filterOptions,
 *   summary,
 *   resetFilters,
 *   hasActiveFilters
 * } = useBranchFilters(branchData);
 *
 * // Update region filter
 * setFilters({ region: 'CDMX' });
 *
 * // Update multiple filters
 * setFilters({ region: 'CDMX', brand: 'Animal' });
 *
 * // Reset all filters
 * resetFilters();
 * ```
 *
 * @performance
 * - Uses useMemo for expensive filtering operations
 * - Optimized dependency arrays to prevent unnecessary recalculations
 * - Client-side filtering for immediate response
 * - Summary calculations memoized based on filtered data
 */
export const useBranchFilters = (branches: BranchSalesData[]): UseBranchFiltersReturn => {
    // Filter state management
    const [filters, setFiltersState] = React.useState<BranchFilters>({
        region: 'all',
        brand: 'all',
    });

    // Extract unique filter options from branch data
    const filterOptions = React.useMemo(() => {
        return extractFilterOptions(branches);
    }, [branches]);

    // Apply filters to branch data
    const filteredBranches = React.useMemo(() => {
        return filterBranches(branches, filters);
    }, [branches, filters]);

    // Calculate summary metrics from filtered data
    const summary = React.useMemo(() => {
        return calculateSummary(filteredBranches);
    }, [filteredBranches]);

    // Check if any filters are active
    const hasActiveFilters = React.useMemo(() => {
        return filters.region !== 'all' || filters.brand !== 'all';
    }, [filters]);

    // Update filters function (allows partial updates)
    const setFilters = React.useCallback((newFilters: Partial<BranchFilters>) => {
        setFiltersState((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }));
    }, []);

    // Reset all filters to default values
    const resetFilters = React.useCallback(() => {
        setFiltersState({
            region: 'all',
            brand: 'all',
        });
    }, []);

    return {
        filters,
        setFilters,
        filteredBranches,
        filterOptions,
        summary,
        resetFilters,
        hasActiveFilters,
    };
};