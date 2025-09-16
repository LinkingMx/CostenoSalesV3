/**
 * Custom hook for managing top products table state and logic
 */

import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type ColumnSizingState,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import React from 'react';
import { productsTableColumns } from '../components/products-table-columns';
import type { TopProduct, TopProductTableRow } from '../types';
import { filterProductsBySearch, getDefaultSorting, getPaginationConfig, transformToTableRows, validateProductsData } from '../utils';

export interface UseTopProductsTableProps {
    data: TopProduct[] | null;
    isLoading?: boolean;
    error?: Error | string | null;
}

export interface UseTopProductsTableReturn {
    // Table instance
    table: ReturnType<typeof useReactTable<TopProductTableRow>>;

    // Search state
    searchValue: string;
    setSearchValue: (value: string) => void;

    // Data states
    tableData: TopProductTableRow[];
    hasData: boolean;
    isEmpty: boolean;
    isValidData: boolean;

    // UI states
    showTable: boolean;
    showEmptyState: boolean;
    showLoadingState: boolean;
    showErrorState: boolean;

    // Pagination helpers
    canPreviousPage: boolean;
    canNextPage: boolean;
    pageCount: number;
    currentPage: number;
    totalItems: number;
    startItem: number;
    endItem: number;
}

export function useTopProductsTable({ data, isLoading = false, error = null }: UseTopProductsTableProps): UseTopProductsTableReturn {
    // Search state
    const [searchValue, setSearchValue] = React.useState('');

    // Table states
    const [sorting, setSorting] = React.useState<SortingState>(getDefaultSorting());
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = React.useState<PaginationState>(getPaginationConfig());
    const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});

    // Validate and transform data
    const { tableData, isValidData } = React.useMemo(() => {
        if (!data || !validateProductsData(data)) {
            return { tableData: [], isValidData: false };
        }

        const transformedData = transformToTableRows(data);
        const filteredData = filterProductsBySearch(transformedData, searchValue);

        return { tableData: filteredData, isValidData: true };
    }, [data, searchValue]);

    // Create table instance
    const table = useReactTable({
        data: tableData,
        columns: productsTableColumns,
        state: {
            sorting,
            columnFilters,
            pagination,
            columnSizing,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        onColumnSizingChange: setColumnSizing,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualFiltering: true, // We handle search filtering manually
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });

    // Reset pagination when search changes
    React.useEffect(() => {
        table.setPageIndex(0);
    }, [searchValue, table]);

    // Reset search when data changes (new API call)
    React.useEffect(() => {
        setSearchValue('');
    }, [data]);

    // Derived states
    const hasData = Array.isArray(data) && data.length > 0;
    const isEmpty = !hasData && !isLoading && !error;
    const showTable = isValidData && hasData && !isLoading && !error;
    const showEmptyState = isEmpty && isValidData;
    const showLoadingState = isLoading;
    const showErrorState = !!error && !isLoading;

    // Pagination helpers
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalItems = tableData.length;
    const pageSize = table.getState().pagination.pageSize;
    const startItem = Math.min(table.getState().pagination.pageIndex * pageSize + 1, totalItems);
    const endItem = Math.min(startItem + pageSize - 1, totalItems);

    return {
        table,
        searchValue,
        setSearchValue,
        tableData,
        hasData,
        isEmpty,
        isValidData,
        showTable,
        showEmptyState,
        showLoadingState,
        showErrorState,
        canPreviousPage,
        canNextPage,
        pageCount,
        currentPage,
        totalItems,
        startItem,
        endItem,
    };
}
