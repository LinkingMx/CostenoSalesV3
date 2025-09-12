/**
 * Daily Sales Branches Component - Main exports
 * 
 * Provides a comprehensive branch sales collapsible component with Spanish localization,
 * conditional rendering based on date selection, and extensive accessibility features.
 * 
 * @fileoverview This barrel export file consolidates all public APIs from the
 * daily-sales-branches component module for clean imports throughout the application.
 * 
 * @example
 * ```tsx
 * // Import main component and types
 * import { DailySalesBranches, type BranchSalesData } from '@/components/daily-sales-branches';
 * 
 * // Import utility functions
 * import { formatCurrency, isSingleDaySelected } from '@/components/daily-sales-branches';
 * ```
 */

// Main component export
export { DailySalesBranches } from './daily-sales-branches';

// TypeScript interface exports for external usage
export type { 
  DailySalesBranchesProps, 
  BranchSalesData, 
  BranchCollapsibleItemProps 
} from './types';

// Utility function exports
export { 
  isSingleDaySelected, 
  formatCurrency, 
  formatPercentage, 
  DUMMY_BRANCHES_DATA 
} from './utils';

// Re-export individual component for advanced usage
export { BranchCollapsibleItem } from './components/branch-collapsible-item';