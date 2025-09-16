/**
 * Branch Sales Categories component exports
 */

export { BranchSalesCategories } from './branch-sales-categories';
export { CategoryCard } from './components/category-card';
export { BranchSalesCategoriesHeader } from './components/branch-sales-categories-header';

// Types
export type {
  BranchSalesData,
  CategoryCardData,
  BranchSalesCategoriesProps,
  CategoryCardProps,
  BranchSalesCategoriesHeaderProps,
  SalesCategory
} from './types';

// Utils
export {
  formatMexicanPesos,
  formatPercentage,
  transformToCategoryCards,
  calculateTotalSales,
  validatePercentages
} from './utils';