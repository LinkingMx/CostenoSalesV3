import type { DateRange } from '@/components/main-filter-calendar';
import { useMonthlyChartContext } from '@/contexts/monthly-chart-context';
import * as React from 'react';
import { logger } from '../lib/logger';
import type { ApiCardData, BranchSalesData } from '../types';
import { isCurrentMonth, isExactMonthSelected, transformApiCardsToBranchData } from '../utils';

/**
 * Custom hook for managing monthly branches data from API.
 * Handles fetching, transformation, and state management for monthly branch sales data.
 *
 * @param {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @returns {UseMonthlyBranchesReturn} Hook state and methods
 *
 * @description This hook:
 * - Validates that exactly one month (first to last day) is selected
 * - Fetches raw API data using the existing monthly chart service
 * - Transforms API cards data to branch format using transformApiCardsToBranchData
 * - Manages loading, error, and data states
 * - Sorts branches by total sales in descending order
 * - For monthly: openAccounts is always 0, totalSales = closedSales
 *
 * @example
 * ```tsx
 * const { branchesData, isLoading, error, isValidCompleteMonth } = useMonthlyBranches(selectedDateRange);
 *
 * if (!isValidCompleteMonth) return null;
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

export interface UseMonthlyBranchesReturn {
    branchesData: BranchSalesData[];
    isLoading: boolean;
    error: string | null;
    isValidCompleteMonth: boolean;
    isCurrentMonth: boolean;
    refetch: () => void;
}

/**
 * Type guard to check if data has the expected API structure
 */
const isValidApiData = (data: unknown): data is { data: { cards: Record<string, ApiCardData> } } => {
    if (!data || typeof data !== 'object' || data === null) {
        return false;
    }

    const apiData = data as Record<string, unknown>;

    if (!apiData.data || typeof apiData.data !== 'object' || apiData.data === null) {
        return false;
    }

    const dataSection = apiData.data as Record<string, unknown>;

    if (!dataSection.cards || typeof dataSection.cards !== 'object' || dataSection.cards === null) {
        return false;
    }

    return true;
};

/**
 * Type guard to check if cards data is valid ApiCardData record
 */
const isValidCardsData = (cards: unknown): cards is Record<string, ApiCardData> => {
    if (!cards || typeof cards !== 'object' || cards === null) {
        return false;
    }

    const cardsRecord = cards as Record<string, unknown>;

    // Check if at least one entry exists and has the expected structure
    const entries = Object.entries(cardsRecord);
    if (entries.length === 0) {
        return true; // Empty object is valid
    }

    // Validate first entry structure
    const [, firstCard] = entries[0];
    if (!firstCard || typeof firstCard !== 'object') {
        return false;
    }

    const card = firstCard as Record<string, unknown>;
    return (
        typeof card.store_id === 'number' &&
        typeof card.open_accounts === 'object' &&
        typeof card.closed_ticket === 'object' &&
        typeof card.brand === 'string' &&
        typeof card.region === 'string'
    );
};

export const useMonthlyBranches = (selectedDateRange?: DateRange): UseMonthlyBranchesReturn => {
    // Get shared data from context - single API call for all monthly components
    const { rawApiData, isLoading, error, refetch, isValidForMonthlyChart } = useMonthlyChartContext();

    // Validate that exactly one complete month is selected (first to last day)
    const isValidCompleteMonth = React.useMemo(() => {
        return isExactMonthSelected(selectedDateRange) && isValidForMonthlyChart;
    }, [selectedDateRange, isValidForMonthlyChart]);

    // Check if the selected month contains today's date
    const isCurrentMonthSelected = React.useMemo(() => {
        return isCurrentMonth(selectedDateRange);
    }, [selectedDateRange]);

    // Memoize data validation to avoid repeated checks
    const validationResult = React.useMemo(() => {
        if (!rawApiData) {
            return { isValid: false, reason: 'no-data' };
        }

        if (!isValidApiData(rawApiData)) {
            return { isValid: false, reason: 'invalid-structure' };
        }

        if (!isValidCardsData(rawApiData.data.cards)) {
            return { isValid: false, reason: 'invalid-cards' };
        }

        return { isValid: true, reason: null };
    }, [rawApiData]);

    // Transform raw API data to branch format with proper type safety and memoization
    const branchesData = React.useMemo(() => {
        if (!validationResult.isValid) {
            switch (validationResult.reason) {
                case 'no-data':
                    logger.debug('No API data available');
                    break;
                case 'invalid-structure':
                    logger.warn('Invalid API data structure', { hasData: !!rawApiData });
                    break;
                case 'invalid-cards':
                    logger.warn('Invalid cards data structure', {
                        cardsType: rawApiData ? typeof (rawApiData as Record<string, unknown>)?.data : 'undefined',
                        hasCards: rawApiData && typeof rawApiData === 'object' && rawApiData !== null &&
                                 'data' in rawApiData && rawApiData.data !== null && typeof rawApiData.data === 'object' &&
                                 'cards' in rawApiData.data
                    });
                    break;
            }
            return [];
        }

        // Type assertion is safe here due to validation above
        const validApiData = rawApiData as { data: { cards: Record<string, ApiCardData> } };

        try {
            const transformedData = transformApiCardsToBranchData(validApiData.data.cards);
            logger.debug('Successfully transformed API data', { branchCount: transformedData.length });
            return transformedData;
        } catch (transformError) {
            logger.error('Error transforming API data', transformError);
            return [];
        }
    }, [validationResult, rawApiData]);

    return {
        branchesData,
        isLoading,
        error,
        isValidCompleteMonth,
        isCurrentMonth: isCurrentMonthSelected,
        refetch,
    };
};
