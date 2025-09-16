/**
 * Daily Sales Branches Component - Main exports
 *
 * Provides a comprehensive branch sales collapsible component with Spanish localization,
 * conditional rendering based on date selection, API integration, and extensive accessibility features.
 *
 * @fileoverview This barrel export file consolidates all public APIs from the
 * daily-sales-branches component module for clean imports throughout the application.
 *
 * Features:
 * - Real-time API integration with main_dashboard_data endpoint
 * - Automatic caching with 20-minute TTL
 * - Loading states and error handling
 * - Fallback to dummy data during development
 * - Spanish localization throughout
 *
 * @example
 * ```tsx
 * // Import main component and types
 * import { DailySalesBranches, type BranchSalesData } from '@/components/daily-sales-branches';
 *
 * // Import API integration hook
 * import { useBranchSalesData } from '@/components/daily-sales-branches';
 *
 * // Import utility functions
 * import { formatCurrency, isSingleDaySelected } from '@/components/daily-sales-branches';
 * ```
 */

// Main component export
export { DailySalesBranches } from './daily-sales-branches';

// API integration hook export
export { useBranchSalesData } from './hooks/use-branch-sales-data';

// TypeScript interface exports for external usage
export type { BranchCollapsibleItemProps, BranchSalesData, DailySalesBranchesProps } from './types';

// Utility function exports
export { DUMMY_BRANCHES_DATA, formatCurrency, formatPercentage, isSingleDaySelected } from './utils';

// Re-export individual components for advanced usage
export { BranchCollapsibleItem } from './components/branch-collapsible-item';
export { DailySalesBranchesSkeleton } from './components/daily-sales-branches-skeleton';
