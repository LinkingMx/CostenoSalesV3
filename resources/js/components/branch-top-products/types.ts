/**
 * Types for BranchTopProducts component
 */

import type { TopProduct } from '@/lib/services/branch-details.service';

// Re-export the main interface
export type { TopProduct };

// Extended interface for table calculations
export interface TopProductTableRow extends TopProduct {
    total: number; // Calculated field: quantity × unit_cost
}

// Table state interfaces
export interface TableSortingState {
    id: string;
    desc: boolean;
}

export interface TablePaginationState {
    pageIndex: number;
    pageSize: number;
}

// Component props interfaces
export interface BranchTopProductsProps {
    data: TopProduct[] | null;
    isLoading?: boolean;
    error?: Error | string | null;
}

export interface ProductsTableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Table column definitions
export interface TableColumn {
    accessorKey: string;
    header: string;
    cell?: (info: unknown) => React.ReactNode;
    enableSorting?: boolean;
    sortingFn?: string;
}
