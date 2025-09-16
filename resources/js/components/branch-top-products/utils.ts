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
        return false;
    }

    return data.every(
        (item) =>
            typeof item === 'object' &&
            typeof item.item_id === 'number' &&
            typeof item.name === 'string' &&
            typeof item.quantity === 'number' &&
            typeof item.unit_cost === 'number' &&
            typeof item.percentage === 'number' &&
            item.name.length > 0 &&
            item.quantity >= 0 &&
            item.unit_cost >= 0 &&
            item.percentage >= 0,
    );
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
