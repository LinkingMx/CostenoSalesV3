/**
 * BranchTopProducts Component
 * Displays a data table of top-selling products for a branch with search, sorting, and pagination
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { AlertCircle, ChevronLeft, ChevronRight, Package, Package2 } from 'lucide-react';
import { ProductsTableSearch } from './components/products-table-search';
import { useTopProductsTable } from './hooks/use-top-products-table';
import type { BranchTopProductsProps } from './types';

/**
 * Loading skeleton for the table
 */
function TableLoadingSkeleton() {
    return (
        <div className="space-y-3">
            {/* Search skeleton */}
            <Skeleton className="h-9 w-full" />

            {/* Table skeleton */}
            <div className="rounded-md border">
                <div className="border-b p-4">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}

/**
 * Empty state when no products are found
 */
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                <Package2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">No hay productos</h3>
            <p className="text-center text-sm text-muted-foreground">No se encontraron productos vendidos en el período seleccionado</p>
        </div>
    );
}

/**
 * Error state component
 */
function ErrorState({ error }: { error: Error | string }) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">Error al cargar productos</h3>
            <p className="text-center text-sm text-muted-foreground">
                {typeof error === 'string' ? error : error.message || 'Ocurrió un error al cargar los datos de productos'}
            </p>
        </div>
    );
}

/**
 * Table pagination component
 */
interface TablePaginationProps {
    canPreviousPage: boolean;
    canNextPage: boolean;
    currentPage: number;
    pageCount: number;
    totalItems: number;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

function TablePagination({
    canPreviousPage,
    canNextPage,
    currentPage,
    pageCount,
    totalItems,
    onPreviousPage,
    onNextPage,
}: TablePaginationProps) {
    if (totalItems === 0) return null;

    return (
        <div className="flex items-center justify-center gap-3">
            <Button
                onClick={onPreviousPage}
                disabled={!canPreviousPage}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none p-0"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-2 text-sm text-muted-foreground">
                Página {currentPage} de {pageCount}
            </span>

            <Button
                onClick={onNextPage}
                disabled={!canNextPage}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none p-0"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

/**
 * Main BranchTopProducts component
 */
export function BranchTopProducts({ data, isLoading = false, error = null }: BranchTopProductsProps) {
    const {
        table,
        searchValue,
        setSearchValue,
        showTable,
        showEmptyState,
        showLoadingState,
        showErrorState,
        canPreviousPage,
        canNextPage,
        currentPage,
        pageCount,
        totalItems,
    } = useTopProductsTable({ data, isLoading, error });

    return (
        <Card className="border-border">
            <CardHeader className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Package className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-base font-medium text-foreground">Productos Más Vendidos</h3>
                        <p className="text-sm text-muted-foreground">Lista detallada de productos por cantidad vendida</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 py-3">
                {showLoadingState && <TableLoadingSkeleton />}

                {showErrorState && <ErrorState error={error!} />}

                {showEmptyState && <EmptyState />}

                {showTable && (
                    <div className="space-y-4">
                        {/* Search */}
                        <ProductsTableSearch value={searchValue} onChange={setSearchValue} placeholder="Buscar producto..." />

                        {/* Table */}
                        <div className="rounded-md border overflow-x-auto">
                            <Table style={{ tableLayout: 'fixed', minWidth: '470px' }}>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header, index) => (
                                                <TableHead
                                                    key={header.id}
                                                    className={`px-3 py-2 ${
                                                        index === 0
                                                            ? 'sticky left-0 z-10 border-r border-border text-white'
                                                            : ''
                                                    }`}
                                                    style={{
                                                        width: `${header.getSize()}px`,
                                                        backgroundColor: index === 0 ? '#6b5d4a' : undefined, // Darkened primary
                                                    }}
                                                >
                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="hover:bg-muted/5">
                                                {row.getVisibleCells().map((cell, cellIndex) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        className={`px-3 py-2 ${
                                                            cellIndex === 0
                                                                ? 'sticky left-0 z-10 border-r border-border'
                                                                : ''
                                                        }`}
                                                        style={{
                                                            width: `${cell.column.getSize()}px`,
                                                            backgroundColor: cellIndex === 0 ? '#6b5d4a' : undefined, // Darkened primary
                                                        }}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package2 className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No se encontraron productos que coincidan con la búsqueda
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <TablePagination
                            canPreviousPage={canPreviousPage}
                            canNextPage={canNextPage}
                            currentPage={currentPage}
                            pageCount={pageCount}
                            totalItems={totalItems}
                            onPreviousPage={() => table.previousPage()}
                            onNextPage={() => table.nextPage()}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default BranchTopProducts;
