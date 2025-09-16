/**
 * TypeScript interfaces for Branch Sales Categories component
 */

export interface SalesCategory {
  money: number;           // Ventas en dinero (pesos mexicanos)
  percentage: number;      // Porcentaje del total de ventas
}

export interface BranchSalesData {
  food: SalesCategory;     // Ventas de alimentos
  drinks: SalesCategory;   // Ventas de bebidas
  others: SalesCategory;   // Ventas de vinos
}

export interface CategoryCardData {
  type: 'food' | 'drinks' | 'others';
  name: string;           // Nombre mostrado (ej: "Alimentos")
  money: number;          // Cantidad en dinero
  percentage: number;     // Porcentaje de participación
  color: string;          // Color del ícono/indicador
  icon: string;           // Nombre del ícono de Lucide
}

export interface BranchSalesCategoriesProps {
  data: BranchSalesData | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export interface CategoryCardProps {
  data: CategoryCardData;
  isLoading?: boolean;
  className?: string;
}

export interface BranchSalesCategoriesHeaderProps {
  title?: string;
  subtitle?: string;
}