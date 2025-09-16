import type { DateRange } from '@/components/main-filter-calendar';
import { fetchCustomSalesComparisonData } from '@/lib/services/custom-sales-comparison.service';
import { formatDateForApi } from '@/lib/services/main-dashboard.service';
import * as React from 'react';
import { logger } from '../lib/logger';
import { isValidApiResponse, isValidCustomDateRange, isSalesCustomDataArray } from '../lib/type-guards';
import type { SalesCustomData } from '../types';
import { isCustomRangeSelected, validateCustomSalesData } from '../lib/validation';

/**
 * Return type for the useCustomSalesComparison hook
 * @interface UseCustomSalesComparisonReturn
 * @property {SalesCustomData[]} customSalesData - Array of custom sales data
 * @property {boolean} isLoading - Loading state
 * @property {string | undefined} error - Error message if any
 * @property {boolean} isValidCustomRange - Whether the selected range is a valid custom range
 * @property {() => void} refetch - Function to refetch data
 */
export interface UseCustomSalesComparisonReturn {
    customSalesData: SalesCustomData[];
    isLoading: boolean;
    error: string | undefined;
    isValidCustomRange: boolean;
    refetch: () => void;
}

/**
 * Custom hook for managing custom sales comparison data from API.
 * Handles fetching, transformation, and state management for custom date range sales data.
 *
 * @param {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @param {SalesCustomData[]} [salesData] - Optional static sales data (overrides API integration)
 * @returns {UseCustomSalesComparisonReturn} Hook state and methods
 *
 * @description This hook:
 * - Validates that a custom date range (not single day, week, or month) is selected
 * - Fetches raw API data using the custom sales comparison service
 * - Manages loading, error, and data states
 * - Validates both input prop data and fetched API data
 * - Provides refetch functionality for error recovery
 * - Supports both API integration and static data fallback
 *
 * @example
 * ```tsx
 * const { customSalesData, isLoading, error, isValidCustomRange } = useCustomSalesComparison(selectedDateRange);
 *
 * if (!isValidCustomRange) return null;
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <ErrorState error={error} />;
 *
 * return (
 *   <div>
 *     {customSalesData.map(data => <CustomCard key={data.date.getTime()} data={data} />)}
 *   </div>
 * );
 * ```
 */
export const useCustomSalesComparison = (
    selectedDateRange?: DateRange,
    salesData?: SalesCustomData[]
): UseCustomSalesComparisonReturn => {
    const [customSalesData, setCustomSalesData] = React.useState<SalesCustomData[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>();

    // Validate that exactly one custom range is selected
    const isValidCustomRange = React.useMemo(() => {
        if (!selectedDateRange) return false;

        // Use type guard for initial validation
        if (!isValidCustomDateRange(selectedDateRange)) {
            return false;
        }

        const isCustom = isCustomRangeSelected(selectedDateRange);
        return isCustom;
    }, [selectedDateRange]);

    // Memoize fetch function to avoid recreation on every render
    const fetchData = React.useCallback(async () => {
        if (!selectedDateRange?.from || !selectedDateRange?.to || !isValidCustomRange) return;

        setIsLoading(true);
        setError(undefined);

        try {
            const startDate = formatDateForApi(selectedDateRange.from);
            const endDate = formatDateForApi(selectedDateRange.to);

            logger.debug('Fetching data for date range', { startDate, endDate });

            const result = await fetchCustomSalesComparisonData(startDate, endDate);

            // Validate API response structure with type guard
            if (!isValidApiResponse(result)) {
                logger.error('Invalid API response structure', { result });
                setError('Respuesta de API inválida');
                setCustomSalesData([]);
                return;
            }

            if (result.error) {
                setError(result.error);
                setCustomSalesData([]);
            } else {
                // Additional validation with type guard
                if (!isSalesCustomDataArray(result.data)) {
                    logger.error('API returned invalid sales data format', { data: result.data });
                    setError('Formato de datos de ventas inválido');
                    setCustomSalesData([]);
                    return;
                }

                setCustomSalesData(result.data);
                setError(undefined);

                // Validate the fetched data for business rules
                const validation = validateCustomSalesData(result.data);
                if (!validation.isValid) {
                    logger.warn('Fetched data validation failed', { errors: validation.errors });
                }
                if (validation.warnings.length > 0) {
                    logger.warn('Data validation warnings', { warnings: validation.warnings });
                }
            }
        } catch (fetchError) {
            logger.error('Failed to fetch custom sales data', fetchError);
            setError('Error al cargar los datos de ventas personalizadas');
            setCustomSalesData([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDateRange, isValidCustomRange]);

    // Handle data fetching and validation effect
    React.useEffect(() => {
        if (!isValidCustomRange) {
            // Clear data only if there's actually data to clear (performance optimization)
            setCustomSalesData((prev) => (prev.length > 0 ? [] : prev));
            setError((prev) => (prev ? undefined : prev));
            return;
        }

        // If custom salesData is provided via props, use it instead of fetching
        if (salesData && salesData.length > 0) {
            // Validate with type guard first
            if (!isSalesCustomDataArray(salesData)) {
                logger.warn('Custom sales data type validation failed, falling back to API');
                // Continue with API fetch as fallback
            } else {
                const validation = validateCustomSalesData(salesData);
                if (validation.isValid) {
                    setCustomSalesData(salesData);
                    setError(undefined);
                    return;
                } else {
                    logger.warn('Custom sales data validation failed, falling back to API', { errors: validation.errors });
                    // Continue with API fetch as fallback
                }
            }
        }

        // Fetch data from API
        fetchData();
    }, [selectedDateRange, salesData, isValidCustomRange, fetchData]);

    // Refetch function for error recovery
    const refetch = React.useCallback(() => {
        if (isValidCustomRange) {
            fetchData();
        }
    }, [fetchData, isValidCustomRange]);

    return {
        customSalesData,
        isLoading,
        error,
        isValidCustomRange,
        refetch,
    };
};