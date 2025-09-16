import type { DateRange } from '@/components/main-filter-calendar';
import { useDailyBranchesContext } from '@/contexts/daily-branches-context';
import * as React from 'react';
import { isSelectedDateToday, isSingleDaySelected } from '../utils';
import type { UseBranchSalesDataReturn } from './use-branch-sales-data';

/**
 * Custom hook for managing daily branches data from shared context.
 * Handles fetching, transformation, and state management for branch sales data.
 *
 * @param {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @returns {UseBranchSalesDataReturn} Hook state and methods
 *
 * @description This hook:
 * - Validates that exactly one day is selected
 * - Fetches raw API data using the shared daily branches context
 * - Manages loading, error, and data states
 * - Provides consistent interface with old hook implementation
 *
 * @example
 * ```tsx
 * const { branchesData, isLoading, error, isVisible, isToday } = useDailyBranchesFromContext(selectedDateRange);
 *
 * if (!isVisible) return null;
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorState error={error} />;
 *
 * return (
 *   <div>
 *     {branchesData.map(branch => <BranchCard key={branch.id} branch={branch} />)}
 *   </div>
 * );
 * ```
 */

export const useDailyBranchesFromContext = (selectedDateRange?: DateRange): UseBranchSalesDataReturn => {
    // Get shared data from context - single API call for all daily components
    const { branches, totalSales, isLoading, error, refetch, isValidForDailyBranches, isToday: isTodayFromContext } = useDailyBranchesContext();

    // Validate that exactly one day is selected (same logic as before)
    const isVisible = React.useMemo(() => {
        return isSingleDaySelected(selectedDateRange);
    }, [selectedDateRange]);

    // Check if the selected date is today (same logic as before)
    const isToday = React.useMemo(() => {
        return isSelectedDateToday(selectedDateRange);
    }, [selectedDateRange]);

    // Transform and sort branches data (same logic as before)
    const branchesData = React.useMemo(() => {
        // Validate branches data to prevent runtime errors
        if (!Array.isArray(branches) || branches.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('DailyBranchesFromContext: Invalid or empty branches data provided');
            }
            return [];
        }

        // Filter out invalid branch objects and log warnings
        const validBranches = branches.filter((branch) => {
            if (!branch || typeof branch !== 'object') {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('DailyBranchesFromContext: Invalid branch object found:', branch);
                }
                return false;
            }
            if (!branch.id || typeof branch.name !== 'string') {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('DailyBranchesFromContext: Branch missing required fields (id, name):', branch);
                }
                return false;
            }
            return true;
        });

        // Sort by total sales in descending order, handling potential NaN values
        return validBranches.sort((a, b) => {
            const salesA = typeof a.totalSales === 'number' ? a.totalSales : 0;
            const salesB = typeof b.totalSales === 'number' ? b.totalSales : 0;
            return salesB - salesA;
        });
    }, [branches]);

    // Provide clear error function
    const clearError = React.useCallback(() => {
        // Since we're using shared context, we don't have direct error clearing
        // This is handled by the context itself
        console.log('Error clearing handled by shared context');
    }, []);

    // Provide refresh function
    const refresh = React.useCallback(async () => {
        try {
            await refetch();
        } catch (error) {
            console.error('Failed to refresh daily branches data:', error);
        }
    }, [refetch]);

    return {
        branches: branchesData,
        totalSales,
        isLoading,
        error,
        isFromCache: false, // For now, assume fresh data
        isVisible,
        isToday: isToday && isTodayFromContext, // Both conditions must be true
        refresh,
        clearError,
    };
};
