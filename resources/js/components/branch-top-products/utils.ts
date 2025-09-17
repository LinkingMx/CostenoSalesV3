/**
 * Utilities for BranchTopProducts component
 */

import type { TopProduct, TopProductTableRow } from './types';

/**
 * Format currency in Mexican Pesos
 */
export function formatMXNCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format currency in Mexican Pesos without decimals
 */
export function formatMXNCurrencyNoDecimals(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format percentage with % symbol
 */
export function formatPercentage(percentage: number): string {
    return `${percentage.toFixed(1)}%`;
}

/**
 * Format quantity with proper decimal places
 * Shows 1 decimal for fractional quantities, whole number for integers
 */
export function formatQuantity(quantity: number): string {
    // If it's a whole number, don't show decimals
    if (quantity % 1 === 0) {
        return quantity.toString();
    }
    // For fractional quantities, show 1 decimal place
    return quantity.toFixed(1);
}

/**
 * Transform TopProduct data to table rows with calculated total
 * Filters out products with unit_cost less than 10 pesos
 */
export function transformToTableRows(products: TopProduct[]): TopProductTableRow[] {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 BranchTopProducts Debug - Raw products received:', {
            totalProducts: products.length,
            productsWithLowCost: products.filter(p => p.unit_cost < 10).length,
            productsWithHighCost: products.filter(p => p.unit_cost >= 10).length,
            sampleProducts: products.slice(0, 3).map(p => ({ name: p.name, unit_cost: p.unit_cost, quantity: p.quantity })),
            lowCostProducts: products.filter(p => p.unit_cost < 10).map(p => ({ name: p.name, unit_cost: p.unit_cost }))
        });
    }

    return products
        .filter((product) => product.unit_cost >= 10)
        .map((product) => ({
            ...product,
            total: product.quantity * product.unit_cost,
        }));
}

/**
 * Filter products by search term (searches in product name)
 */
export function filterProductsBySearch(products: TopProductTableRow[], searchTerm: string): TopProductTableRow[] {
    if (!searchTerm.trim()) {
        return products;
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();

    return products.filter((product) => product.name.toLowerCase().includes(normalizedSearch));
}

/**
 * Validate if products data is valid
 */
export function validateProductsData(data: unknown): data is TopProduct[] {
    if (!Array.isArray(data)) {
        if (process.env.NODE_ENV === 'development') {
            console.error('🔍 BranchTopProducts Validation - Data is not an array:', typeof data);
        }
        return false;
    }

    const isValid = data.every(
        (item) => {
            const validItem = typeof item === 'object' &&
                item !== null &&
                // item_id can be string or number (API sometimes returns empty string)
                (typeof item.item_id === 'number' || typeof item.item_id === 'string') &&
                typeof item.name === 'string' &&
                typeof item.quantity === 'number' &&
                typeof item.unit_cost === 'number' &&
                typeof item.percentage === 'number' &&
                item.name.length > 0 &&
                item.quantity >= 0 &&
                item.unit_cost >= 0 &&
                item.percentage >= 0;

            if (!validItem && process.env.NODE_ENV === 'development') {
                console.error('🔍 BranchTopProducts Validation - Invalid item:', {
                    item,
                    checks: {
                        isObject: typeof item === 'object' && item !== null,
                        hasValidItemId: typeof item?.item_id === 'number' || typeof item?.item_id === 'string',
                        hasValidName: typeof item?.name === 'string' && item?.name?.length > 0,
                        hasValidQuantity: typeof item?.quantity === 'number' && item?.quantity >= 0,
                        hasValidUnitCost: typeof item?.unit_cost === 'number' && item?.unit_cost >= 0,
                        hasValidPercentage: typeof item?.percentage === 'number' && item?.percentage >= 0,
                    }
                });
            }

            return validItem;
        }
    );

    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 BranchTopProducts Validation Result:', {
            isValid,
            dataLength: data.length,
            sampleItem: data[0]
        });
    }

    return isValid;
}

/**
 * Truncate product name if too long for mobile display
 */
export function truncateProductName(name: string, maxLength: number = 25): string {
    if (name.length <= maxLength) {
        return name;
    }
    return `${name.substring(0, maxLength - 3)}...`;
}

/**
 * Calculate total sales amount from products
 * Excludes products with unit_cost less than 10 pesos
 */
export function calculateTotalSales(products: TopProduct[]): number {
    return products
        .filter((product) => product.unit_cost >= 10)
        .reduce((total, product) => total + product.quantity * product.unit_cost, 0);
}

/**
 * Get default sorting state - quantity descending
 */
export function getDefaultSorting() {
    return [{ id: 'quantity', desc: true }];
}

/**
 * Get pagination configuration
 */
export function getPaginationConfig() {
    return {
        pageIndex: 0,
        pageSize: 10,
    };
}

/**
 * Validate search input (prevent special characters that could cause issues)
 */
export function sanitizeSearchInput(input: string): string {
    // Remove any characters that aren't letters, numbers, spaces, or common punctuation
    return input.replace(/[^\w\s\-.,áéíóúüñÁÉÍÓÚÜÑ]/g, '').trim();
}
