import type { DateRange } from '@/components/main-filter-calendar';

/**
 * @fileoverview Type definitions for the Daily Sales Branches component system
 *
 * This file contains comprehensive TypeScript interfaces for the daily sales branches
 * feature, including data structures for API integration, component props, and
 * business logic types.
 *
 * Key features:
 * - Full API integration with main_dashboard_data endpoint
 * - Week-over-week percentage comparison calculations
 * - Conditional rendering based on single-day selections
 * - Spanish localization support for all UI elements
 * - Rate limiting and performance optimizations
 *
 * @author CostenoSalesV3 Development Team
 * @since 2025-09-14
 * @version 1.3.0
 */

/**
 * Comprehensive sales data interface for a single branch location.
 * Contains all metrics needed to display detailed branch performance in Spanish-localized UI.
 *
 * @interface BranchSalesData
 * @property {string} id - Unique branch identifier (typically numeric but stored as string)
 * @property {string} name - Human-readable branch name displayed in the UI
 * @property {string} [location] - Optional branch location/city for additional context
 * @property {string} [brand] - Optional brand name for filtering and grouping purposes
 * @property {number} totalSales - Total sales amount in USD currency
 * @property {number} percentage - Growth percentage (positive/negative) for period comparison
 * @property {number} openAccounts - Total amount from pending/open transactions
 * @property {number} closedSales - Total amount from completed transactions
 * @property {number} averageTicket - Average transaction amount per ticket
 * @property {number} totalTickets - Total number of transactions/tickets processed
 * @property {string} avatar - Single character identifier for branch visual display
 * @property {number} [previousWeekSales] - Total sales from same day previous week (for comparison context)
 *
 * @description This interface represents the core data structure for branch sales analytics.
 * All monetary values are expected to be in USD and will be formatted using Spanish
 * locale conventions (es-MX) for consistent presentation.
 *
 * @example
 * ```tsx
 * const branchData: BranchSalesData = {
 *   id: '5',
 *   name: 'L\u00e1zaro y Diego',
 *   location: 'Metropolitan',
 *   brand: 'Animal',
 *   totalSales: 74326.60,
 *   percentage: 22.5,
 *   openAccounts: 6490.60,
 *   closedSales: 67836.00,
 *   averageTicket: 369.78,
 *   totalTickets: 100,
 *   avatar: 'L'
 * };
 * ```
 *
 * @see {@link formatCurrency} for monetary value formatting
 * @see {@link formatPercentage} for percentage display formatting
 */
export interface BranchSalesData {
    id: string;
    name: string;
    location?: string;
    brand?: string;
    totalSales: number;
    percentage: number;
    openAccounts: number;
    closedSales: number;
    averageTicket: number;
    totalTickets: number;
    avatar: string;
    previousWeekSales?: number;
}

/**
 * Props interface for the DailySalesBranches component.
 * Provides configuration options for displaying branch sales data with conditional visibility and API integration.
 *
 * @interface DailySalesBranchesProps
 * @property {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @property {BranchSalesData[]} [branches] - Optional static branch data (overrides API integration)
 *
 * @description This interface defines the external API for the DailySalesBranches component.
 * The component now supports both API integration and static data:
 * - When `branches` is provided: Uses static data, disables API calls
 * - When `branches` is undefined: Automatically fetches data from main_dashboard_data endpoint
 * - Conditional rendering based on selectedDateRange (only shows for single-day selections)
 *
 * @example
 * ```tsx
 * // API-integrated usage (recommended for production)
 * <DailySalesBranches selectedDateRange={singleDayRange} />
 *
 * // Static data usage (testing/fallback)
 * <DailySalesBranches
 *   selectedDateRange={singleDayRange}
 *   branches={staticBranchData}
 * />
 *
 * // Will not render when multiple days selected
 * <DailySalesBranches selectedDateRange={multiDayRange} /> // Returns null
 * ```
 *
 * @see {@link DateRange} for date range structure details
 * @see {@link BranchSalesData} for branch data structure
 * @see {@link useBranchSalesData} for API integration hook
 * @see {@link isSingleDaySelected} for visibility logic
 */
export interface DailySalesBranchesProps {
    selectedDateRange?: DateRange;
    branches?: BranchSalesData[];
}

/**
 * Props interface for individual BranchCollapsibleItem components.
 * Defines the data needed to render a single branch as an independent collapsible.
 *
 * @interface BranchCollapsibleItemProps
 * @property {BranchSalesData} branch - Complete branch sales data object
 * @property {boolean} [isToday] - Whether the selected date is today (affects open accounts display)
 *
 * @description This interface ensures type safety for individual branch collapsible items.
 * Unlike accordion items, collapsibles don't require a value prop since each operates independently.
 * The isToday flag is used to conditionally show open accounts (only relevant for current day).
 *
 * @example
 * ```tsx
 * // Typical usage within map iteration
 * {branches.map((branch) => (
 *   <BranchCollapsibleItem
 *     key={branch.id}
 *     branch={branch}
 *     isToday={selectedDateIsToday}
 *   />
 * ))}
 * ```
 *
 * @see {@link BranchSalesData} for branch data structure
 * @see {@link DailySalesBranches} for parent component usage
 */
export interface BranchCollapsibleItemProps {
    branch: BranchSalesData;
    isToday?: boolean;
}

/**
 * State interface for branch filters (region and brand).
 * Controls which filters are currently active in the UI.
 *
 * @interface BranchFiltersState
 * @property {string} selectedRegion - Currently selected region filter ('all' for no filter)
 * @property {string} selectedBrand - Currently selected brand filter ('all' for no filter)
 *
 * @description This interface manages the filter state for the branch sales components.
 * Both filters use 'all' as the default value to indicate no filtering is applied.
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<BranchFiltersState>({
 *   selectedRegion: 'all',
 *   selectedBrand: 'all'
 * });
 * ```
 */
export interface BranchFiltersState {
    selectedRegion: string;
    selectedBrand: string;
}

/**
 * Props interface for the BranchFilters component.
 * Provides all necessary data and callbacks for filter functionality.
 *
 * @interface BranchFiltersProps
 * @property {BranchSalesData[]} branches - Array of branches for extracting filter options
 * @property {BranchFiltersState} filters - Current filter state
 * @property {function} onFiltersChange - Callback when filters are modified
 * @property {string[]} availableRegions - Available region options for dropdown
 * @property {string[]} availableBrands - Available brand options for dropdown
 *
 * @description This interface defines the contract for the filter component,
 * ensuring all necessary data and interaction handlers are provided.
 */
export interface BranchFiltersProps {
    branches: BranchSalesData[];
    filters: BranchFiltersState;
    onFiltersChange: (filters: BranchFiltersState) => void;
    availableRegions: string[];
    availableBrands: string[];
}

/**
 * Props interface for the BranchSummaryCard component.
 * Displays aggregated metrics for filtered branch data.
 *
 * @interface BranchSummaryCardProps
 * @property {BranchSalesData[]} filteredBranches - Array of branches after filtering
 * @property {boolean} [isLoading] - Loading state for skeleton display
 *
 * @description This interface provides the filtered branch data needed to calculate
 * and display summary metrics like total sales, average percentage, and branch count.
 */
export interface BranchSummaryCardProps {
    filteredBranches: BranchSalesData[];
    isLoading?: boolean;
}
