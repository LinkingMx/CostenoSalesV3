/**
 * Branch Sales Categories component exports
 */

export { BranchSalesCategories } from './branch-sales-categories';
export { BranchSalesCategoriesHeader } from './components/branch-sales-categories-header';
export { CategoryCard } from './components/category-card';

// Types
export type {
    BranchSalesCategoriesHeaderProps,
    BranchSalesCategoriesProps,
    BranchSalesData,
    CategoryCardData,
    CategoryCardProps,
    SalesCategory,
} from './types';

// Utils
export { calculateTotalSales, formatMexicanPesos, formatPercentage, transformToCategoryCards, validatePercentages } from './utils';
