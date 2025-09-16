/**
 * Column definitions for products table using TanStack Table
 */

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createColumnHelper } from '@tanstack/react-table';
import { ArrowUpDown, Info } from 'lucide-react';
import React from 'react';
import type { TopProductTableRow } from '../types';
import { formatMXNCurrency, formatMXNCurrencyNoDecimals, formatQuantity, truncateProductName } from '../utils';

const columnHelper = createColumnHelper<TopProductTableRow>();

/**
 * Sortable header component
 */
interface SortableHeaderProps {
    children: React.ReactNode;
    canSort: boolean;
    isSorted: false | 'asc' | 'desc';
    onClick: () => void;
}

function SortableHeader({ children, canSort, onClick }: SortableHeaderProps) {
    if (!canSort) {
        return <div className="font-medium text-foreground">{children}</div>;
    }

    return (
        <Button variant="ghost" onClick={onClick} className="h-auto p-0 font-medium text-foreground hover:bg-transparent hover:text-foreground">
            <span className="flex items-center gap-3">
                {children}
                <div className="flex h-5 w-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <ArrowUpDown className="h-3 w-3 text-primary-foreground" />
                </div>
            </span>
        </Button>
    );
}

/**
 * Product name cell with truncation and iOS-compatible popover
 */
function ProductNameCell({ getValue }: { getValue: () => string }) {
    const fullName = getValue();
    const truncatedName = truncateProductName(fullName, 18);

    // Show popover if truncated
    if (fullName !== truncatedName) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button className="group flex items-center gap-1 text-left font-medium text-white">
                        <span>{truncatedName}</span>
                        <Info className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" side="top" align="start">
                    <p className="text-sm font-medium">{fullName}</p>
                </PopoverContent>
            </Popover>
        );
    }

    return <div className="font-medium text-white">{fullName}</div>;
}

/**
 * Quantity cell with proper formatting
 */
function QuantityCell({ getValue }: { getValue: () => number }) {
    const quantity = getValue();
    return <div className="text-right text-foreground">{formatQuantity(quantity)}</div>;
}

/**
 * Currency cell component
 */
function CurrencyCell({ getValue }: { getValue: () => number }) {
    const amount = getValue();
    return <div className="text-right text-foreground">{formatMXNCurrency(amount)}</div>;
}

/**
 * Currency cell component without decimals
 */
function CurrencyCellNoDecimals({ getValue }: { getValue: () => number }) {
    const amount = getValue();
    return <div className="text-right text-foreground">{formatMXNCurrencyNoDecimals(amount)}</div>;
}

/**
 * Column definitions for the products table
 */
export const productsTableColumns = [
    columnHelper.accessor('name', {
        header: ({ column }) => (
            <SortableHeader canSort={column.getCanSort()} isSorted={column.getIsSorted()} onClick={() => column.toggleSorting()}>
                Producto
            </SortableHeader>
        ),
        cell: ProductNameCell,
        enableSorting: false,
        sortingFn: 'alphanumeric',
        size: 180, // Fixed 180px width for product column (double width for mobile)
    }),

    columnHelper.accessor('quantity', {
        header: ({ column }) => (
            <SortableHeader canSort={column.getCanSort()} isSorted={column.getIsSorted()} onClick={() => column.toggleSorting()}>
                <div className="w-full text-right">Qty</div>
            </SortableHeader>
        ),
        cell: QuantityCell,
        enableSorting: true,
        sortingFn: 'basic',
        size: 80, // Fixed 80px width for "Cantidad" mobile
    }),

    columnHelper.accessor('unit_cost', {
        header: ({ column }) => (
            <SortableHeader canSort={column.getCanSort()} isSorted={column.getIsSorted()} onClick={() => column.toggleSorting()}>
                <div className="w-full text-right">$ Unit</div>
            </SortableHeader>
        ),
        cell: CurrencyCellNoDecimals,
        enableSorting: true,
        sortingFn: 'basic',
        size: 100, // Fixed 100px width for "Precio Unit." mobile
    }),

    columnHelper.accessor('total', {
        header: ({ column }) => (
            <SortableHeader canSort={column.getCanSort()} isSorted={column.getIsSorted()} onClick={() => column.toggleSorting()}>
                <div className="w-full text-right">TT</div>
            </SortableHeader>
        ),
        cell: CurrencyCellNoDecimals,
        enableSorting: true,
        sortingFn: 'basic',
        size: 110, // Fixed 110px width for "Total" mobile
    }),
];
