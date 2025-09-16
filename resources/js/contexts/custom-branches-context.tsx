/**
 * Custom Branches Context
 * Shared context for custom range branch sales data to avoid duplicate API calls
 */

import type { DateRange } from '@/components/main-filter-calendar';
import type { BranchCustomSalesData } from '@/components/custom-sales-branches/types';
import { useCustomBranches } from '@/components/custom-sales-branches/hooks/use-custom-branches';
import React, { createContext, ReactNode, useContext } from 'react';

interface CustomBranchesContextValue {
    branchesData: BranchCustomSalesData[];
    isLoading: boolean;
    error: string | null;
    isValidCustomRange: boolean;
    refetch: () => void;
}

const CustomBranchesContext = createContext<CustomBranchesContextValue | null>(null);

interface CustomBranchesProviderProps {
    children: ReactNode;
    selectedDateRange: DateRange | undefined;
}

/**
 * Provider component that makes optimized API calls and shares custom branches data
 */
export const CustomBranchesProvider: React.FC<CustomBranchesProviderProps> = React.memo(({ children, selectedDateRange }) => {
    const customBranchesData = useCustomBranches(selectedDateRange);

    return <CustomBranchesContext.Provider value={customBranchesData}>{children}</CustomBranchesContext.Provider>;
});

CustomBranchesProvider.displayName = 'CustomBranchesProvider';

/**
 * Hook to consume the shared custom branches data
 */
export const useCustomBranchesContext = (): CustomBranchesContextValue => {
    const context = useContext(CustomBranchesContext);

    if (!context) {
        throw new Error('useCustomBranchesContext must be used within a CustomBranchesProvider');
    }

    return context;
};