/**
 * Utility functions for Branch Total Sales component
 */

import type { StoreData } from '@/lib/services/branch-details.service';
import type { TotalSalesData } from './types';

/**
 * Transform StoreData to TotalSalesData format
 */
export function transformToTotalSalesData(data: StoreData): TotalSalesData {
    const openMoneyBeforeIVA = data.ticket?.open_money || 0;
    const closedMoneyBeforeIVA = data.ticket?.closed_money || 0;

    // Agregar 16% de IVA a los valores (multiplicar por 1.16)
    const openMoney = openMoneyBeforeIVA * 1.16;
    const closedMoney = closedMoneyBeforeIVA * 1.16;
    const totalSales = openMoney + closedMoney;

    const discounts = data.discounts || 0;
    const totalDiners = data.total_diners || 0; // Total de comensales

    // Calcular ticket promedio: Venta Total / Comensales
    const diners = totalDiners > 0 ? totalSales / totalDiners : 0;

    return {
        openMoney,
        closedMoney,
        totalSales,
        discounts,
        diners,
        totalDiners,
    };
}

/**
 * Format currency for Mexican pesos
 */
export function formatCurrency(amount: number): string {
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        return '$0.00';
    }

    try {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        console.error('formatCurrency: Formatting error:', error);
        return `$${amount.toFixed(2)}`;
    }
}

/**
 * Calculate percentage of open vs closed sales
 */
export function calculatePercentage(amount: number, total: number): number {
    if (!total || total === 0) return 0;
    return (amount / total) * 100;
}
