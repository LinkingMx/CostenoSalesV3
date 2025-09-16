/**
 * TypeScript interfaces for Branch Total Sales component
 */

export interface TotalSalesData {
  openMoney: number;      // Dinero en cuentas abiertas
  closedMoney: number;    // Dinero en cuentas cerradas
  totalSales: number;     // Total de ventas (open + closed)
  discounts: number;      // Total de descuentos
  diners: number;         // Ticket promedio (usando diners del API)
}

export interface BranchTotalSalesProps {
  data: TotalSalesData | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}