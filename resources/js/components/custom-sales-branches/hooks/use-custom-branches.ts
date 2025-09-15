import * as React from 'react';
import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchCustomSalesData } from '../types';
import { isCustomRangeSelected } from '../utils';

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
 * Transform API cards data to BranchCustomSalesData format.
 * Maps the API response structure to the component interface format.
 *
 * @param cardsData - Raw cards data from API response
 * @returns Array of transformed branch sales data sorted by total sales
 */
function transformApiCardsToBranchData(cardsData: Record<string, any>): BranchCustomSalesData[] {
  if (!cardsData || typeof cardsData !== 'object') {
    console.warn('transformApiCardsToBranchData: Invalid cardsData provided');
    return [];
  }

  try {
    return Object.entries(cardsData)
      .map(([branchName, apiData]: [string, any]) => {
        // Validate required data structure
        if (!apiData || typeof apiData !== 'object') {
          console.warn(`transformApiCardsToBranchData: Invalid branch data for ${branchName}`);
          return null;
        }

        const {
          open_accounts,
          closed_ticket,
          average_ticket,
          brand,
          region
        } = apiData;

        // Validate required fields
        if (!open_accounts || !closed_ticket) {
          console.warn(`transformApiCardsToBranchData: Missing required fields for ${branchName}`);
          return null;
        }

        // Calculate totals
        const openAccountsAmount = open_accounts.money || 0;
        const closedAccountsAmount = closed_ticket.money || 0;
        const totalSales = openAccountsAmount + closedAccountsAmount;

        // Calculate total tickets
        const openTickets = open_accounts.total || 0;
        const closedTickets = closed_ticket.total || 0;
        const totalTickets = openTickets + closedTickets;

        // Generate avatar from brand or branch name
        let avatar = 'B'; // Default
        if (brand && typeof brand === 'string') {
          avatar = brand.charAt(0).toUpperCase();
        } else {
          avatar = branchName.charAt(0).toUpperCase();
        }

        const transformedBranch: BranchCustomSalesData = {
          id: branchName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
          name: branchName,
          totalSales,
          percentage: 0, // Not used, will be removed from UI
          openAccounts: openAccountsAmount,
          closedSales: closedAccountsAmount,
          averageTicket: average_ticket || 0,
          totalTickets,
          avatar
        };

        // Add location if provided
        if (region && typeof region === 'string') {
          transformedBranch.location = region;
        }

        return transformedBranch;
      })
      .filter((branch): branch is BranchCustomSalesData => branch !== null)
      .sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales descending
  } catch (error) {
    console.error('transformApiCardsToBranchData: Transformation error:', error);
    return [];
  }
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

  // Fetch and transform data
  const fetchData = React.useCallback(async () => {
    if (!isValidCustomRange || !selectedDateRange?.from || !selectedDateRange?.to) {
      setBranchesData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 useCustomBranches: Fetching data for range:', {
        startDate: selectedDateRange.from.toISOString().split('T')[0],
        endDate: selectedDateRange.to.toISOString().split('T')[0]
      });

      // Fetch each day individually to get the cards data
      const startDate = new Date(selectedDateRange.from);
      const endDate = new Date(selectedDateRange.to);
      const allBranchesMap = new Map<string, any>();

      // Get each day's data
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];

        try {
          const response = await fetch('http://192.168.100.20/api/main_dashboard_data', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer 342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f'
            },
            body: JSON.stringify({
              start_date: dateStr,
              end_date: dateStr
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const dayData = await response.json();

          if (dayData.success && dayData.data?.cards) {
            // Aggregate branches data
            Object.entries(dayData.data.cards).forEach(([branchName, branchData]: [string, any]) => {
              if (!allBranchesMap.has(branchName)) {
                allBranchesMap.set(branchName, {
                  ...branchData,
                  open_accounts: { ...branchData.open_accounts },
                  closed_ticket: { ...branchData.closed_ticket }
                });
              } else {
                const existing = allBranchesMap.get(branchName);
                // Aggregate the amounts
                existing.open_accounts.money += branchData.open_accounts?.money || 0;
                existing.open_accounts.total += branchData.open_accounts?.total || 0;
                existing.closed_ticket.money += branchData.closed_ticket?.money || 0;
                existing.closed_ticket.total += branchData.closed_ticket?.total || 0;

                // Update average ticket (this is a simple average, could be weighted)
                existing.average_ticket = (existing.average_ticket + (branchData.average_ticket || 0)) / 2;
              }
            });
          }
        } catch (dayError) {
          console.warn(`Failed to fetch data for ${dateStr}:`, dayError);
        }
      }

      // Transform aggregated data
      const cardsObject = Object.fromEntries(allBranchesMap);
      const transformedData = transformApiCardsToBranchData(cardsObject);

      setBranchesData(transformedData);

      if (process.env.NODE_ENV === 'development') {
        console.log(`useCustomBranches: Transformed ${transformedData.length} branches from API data`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching custom branches data';
      console.error('useCustomBranches: Error fetching data:', err);
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
    refetch
  };
};