import type { DateRange } from '@/components/main-filter-calendar';
import * as React from 'react';
import { fetchCustomSalesBranchesData } from '@/lib/services/custom-sales-branches.service';
import type { BranchCustomSalesData } from '../types';
import { isCustomRangeSelected } from '../utils';
import { logger } from '../lib/logger';


/**
 * Interface for the useCustomBranches hook return value.
 */
export interface UseCustomBranchesReturn {
    branchesData: BranchCustomSalesData[];
    isLoading: boolean;
    error: string | null;
    isValidCustomRange: boolean;
    refetch: () => void;
}


/**
 * Custom hook for managing custom range branches data from API.
 * Handles fetching, transformation, and state management for custom range branch sales data.
 *
 * @param selectedDateRange - Current date selection from main filter calendar
 * @returns Hook state and methods
 */
export const useCustomBranches = (selectedDateRange?: DateRange): UseCustomBranchesReturn => {
    const [branchesData, setBranchesData] = React.useState<BranchCustomSalesData[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Validate that a custom range is selected
    const isValidCustomRange = React.useMemo(() => {
        return isCustomRangeSelected(selectedDateRange);
    }, [selectedDateRange]);

    // Fetch data using service layer
    const fetchData = React.useCallback(async () => {
        if (!isValidCustomRange || !selectedDateRange?.from || !selectedDateRange?.to) {
            setBranchesData([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const startDate = selectedDateRange.from.toISOString().split('T')[0];
            const endDate = selectedDateRange.to.toISOString().split('T')[0];

            logger.debug('Fetching data for range:', { startDate, endDate });

            const result = await fetchCustomSalesBranchesData(startDate, endDate);

            if (result.error) {
                setError(result.error);
                setBranchesData([]);
            } else {
                setBranchesData(result.data);
                logger.info(`Loaded ${result.data.length} branches from service`, {
                    branchCount: result.data.length,
                    dateRange: `${startDate} to ${endDate}`,
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error fetching custom branches data';
            logger.error('Error fetching data:', err);
            setError(errorMessage);
            setBranchesData([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDateRange, isValidCustomRange]);

    // Fetch data when date range changes
    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = React.useCallback(() => {
        fetchData();
    }, [fetchData]);

    return {
        branchesData,
        isLoading,
        error,
        isValidCustomRange,
        refetch,
    };
};
