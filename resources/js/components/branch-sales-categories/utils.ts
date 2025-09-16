/**
 * Utility functions for Branch Sales Categories component
 */

import type { BranchSalesData, CategoryCardData } from './types';

/**
 * Format currency amount in Mexican pesos
 */
export function formatMexicanPesos(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(percentage: number): string {
    return `${percentage}%`;
}

/**
 * Transform API data to category cards data
 */
export function transformToCategoryCards(data: BranchSalesData): CategoryCardData[] {
    return [
        {
            type: 'food',
            name: 'Alimentos',
            money: data.food.money,
            percentage: data.food.percentage,
            color: 'text-green-600',
            icon: 'UtensilsCrossed',
        },
        {
            type: 'drinks',
            name: 'Bebidas',
            money: data.drinks.money,
            percentage: data.drinks.percentage,
            color: 'text-blue-600',
            icon: 'Coffee',
        },
        {
            type: 'others',
            name: 'Vinos',
            money: data.others.money,
            percentage: data.others.percentage,
            color: 'text-purple-600',
            icon: 'Wine',
        },
    ];
}

/**
 * Calculate total sales from all categories
 */
export function calculateTotalSales(data: BranchSalesData): number {
    return data.food.money + data.drinks.money + data.others.money;
}

/**
 * Validate that percentages add up correctly (allow small rounding differences)
 */
export function validatePercentages(data: BranchSalesData): boolean {
    const total = data.food.percentage + data.drinks.percentage + data.others.percentage;
    const tolerance = 2; // Allow 2% tolerance for rounding
    return Math.abs(total - 100) <= tolerance;
}
