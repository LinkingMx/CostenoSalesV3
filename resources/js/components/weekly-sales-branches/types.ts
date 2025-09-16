import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Comprehensive sales data interface for a single branch location.
 * Contains all metrics needed to display detailed branch performance in Spanish-localized UI.
 *
 * @interface BranchSalesData
 * @property {string} id - Unique branch identifier (typically numeric but stored as string)
 * @property {string} name - Human-readable branch name displayed in the UI
 * @property {string} [location] - Optional branch location/city for additional context
 * @property {number} totalSales - Total sales amount (sum of open + closed accounts) in Mexican pesos
 * @property {number} percentage - Growth percentage (positive/negative) for period comparison
 * @property {number} openAccounts - Total amount from pending/open transactions
 * @property {number} closedSales - Total amount from completed transactions
 * @property {number} averageTicket - Average transaction amount per ticket
 * @property {number} totalTickets - Total number of transactions/tickets processed
 * @property {string} avatar - Single character identifier for branch visual display
 *
 * @description This interface represents the core data structure for branch sales analytics.
 * All monetary values are in Mexican pesos and will be formatted using Spanish
 * locale conventions (es-MX) for consistent presentation.
 *
 * @example
 * ```tsx
 * const branchData: BranchSalesData = {
 *   id: '5',
 *   name: 'Lázaro y Diego',
 *   location: 'Metropolitan',
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
    totalSales: number;
    percentage: number;
    openAccounts: number;
    closedSales: number;
    averageTicket: number;
    totalTickets: number;
    avatar: string;
}

/**
 * Props interface for the WeeklySalesBranches component.
 * Provides configuration options for displaying branch sales data with conditional visibility.
 *
 * @interface WeeklySalesBranchesProps
 * @property {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 *
 * @description This interface defines the external API for the WeeklySalesBranches component.
 * The component uses conditional rendering based on the selectedDateRange to ensure
 * data relevance - it only displays when exactly one week (Monday to Sunday) is selected.
 * Branch data is now fetched automatically from the API using the useWeeklyBranches hook.
 *
 * @example
 * ```tsx
 * // Usage with real API data - shows for exact week selection
 * <WeeklySalesBranches selectedDateRange={exactWeekRange} />
 *
 * // Will not render when not exact week selected
 * <WeeklySalesBranches selectedDateRange={partialWeekRange} /> // Returns null
 * ```
 *
 * @see {@link DateRange} for date range structure details
 * @see {@link BranchSalesData} for branch data structure
 * @see {@link useWeeklyBranches} for API integration logic
 */
export interface WeeklySalesBranchesProps {
    selectedDateRange?: DateRange;
}

/**
 * Props interface for individual BranchCollapsibleItem components.
 * Defines the data needed to render a single branch as an independent collapsible.
 *
 * @interface BranchCollapsibleItemProps
 * @property {BranchSalesData} branch - Complete branch sales data object
 *
 * @description This interface ensures type safety for individual branch collapsible items.
 * Unlike accordion items, collapsibles don't require a value prop since each operates independently.
 *
 * @example
 * ```tsx
 * // Typical usage within map iteration
 * {branches.map((branch) => (
 *   <BranchCollapsibleItem
 *     key={branch.id}
 *     branch={branch}
 *   />
 * ))}
 * ```
 *
 * @see {@link BranchSalesData} for branch data structure
 * @see {@link WeeklySalesBranches} for parent component usage
 */
export interface BranchCollapsibleItemProps {
    branch: BranchSalesData;
    isCurrentWeek: boolean;
}

/**
 * Return type for the useWeeklyBranches hook.
 * Provides state and methods for managing weekly branches data.
 */
export interface UseWeeklyBranchesReturn {
    branchesData: BranchSalesData[];
    isLoading: boolean;
    error: string | null;
    isValidCompleteWeek: boolean;
    isCurrentWeek: boolean;
    refetch: () => void;
}

/**
 * Props interface for the WeeklyBranchesError component.
 * Defines error display and retry functionality.
 */
export interface WeeklyBranchesErrorProps {
    error: string;
    onRetry?: () => void;
}

/**
 * Interface for API card data structure from the weekly chart service.
 * Defines the raw data format returned by the API.
 */
export interface ApiCardData {
    store_id: number;
    closed_ticket: {
        money: number;
        total: number;
    };
    open_accounts?: {
        money: number;
    };
    percentage: {
        qty: number;
    };
    average_ticket: number;
    brand?: string;
    region?: string;
}
