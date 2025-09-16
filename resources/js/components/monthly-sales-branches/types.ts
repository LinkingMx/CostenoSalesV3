import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Comprehensive sales data interface for a single branch location (monthly version).
 * Contains all metrics needed to display detailed monthly branch performance in Spanish-localized UI.
 *
 * @interface BranchSalesData
 * @property {string} id - Unique branch identifier (typically numeric but stored as string)
 * @property {string} name - Human-readable branch name displayed in the UI
 * @property {string} [location] - Optional branch location/city for additional context
 * @property {number} totalSales - Total sales amount (sum of open + closed accounts) in Mexican pesos
 * @property {number} percentage - Growth percentage (positive/negative) vs previous month
 * @property {number} openAccounts - Total amount from pending/open transactions (always 0 for monthly)
 * @property {number} closedSales - Total amount from completed transactions
 * @property {number} averageTicket - Average transaction amount per ticket
 * @property {number} totalTickets - Total number of transactions/tickets processed
 * @property {string} avatar - Single character identifier for branch visual display
 *
 * @description This interface represents the core data structure for monthly branch sales analytics.
 * All monetary values are in Mexican pesos and will be formatted using Spanish
 * locale conventions (es-MX) for consistent presentation.
 *
 * Key differences from weekly:
 * - openAccounts is always 0 (no open accounts in monthly view)
 * - percentage compares to previous month instead of previous week
 * - totalSales = closedSales (since openAccounts is always 0)
 *
 * @example
 * ```tsx
 * const branchData: BranchSalesData = {
 *   id: '5',
 *   name: 'Animal (Calzada)',
 *   location: 'AM-AF',
 *   totalSales: 5780205.65,
 *   percentage: 53.31,
 *   openAccounts: 0, // Always 0 for monthly
 *   closedSales: 5780205.65,
 *   averageTicket: 1034.03,
 *   totalTickets: 1990,
 *   avatar: 'A'
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
 * Props interface for the MonthlySalesBranches component.
 * Provides configuration options for displaying monthly branch sales data with conditional visibility.
 *
 * @interface MonthlySalesBranchesProps
 * @property {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 *
 * @description This interface defines the external API for the MonthlySalesBranches component.
 * The component uses conditional rendering based on the selectedDateRange to ensure
 * data relevance - it only displays when exactly one month is selected.
 * Branch data is fetched automatically from the MonthlyChartProvider using the useMonthlyBranches hook.
 *
 * @example
 * ```tsx
 * // Usage with real API data - shows for exact month selection
 * <MonthlySalesBranches selectedDateRange={exactMonthRange} />
 *
 * // Will not render when not exact month selected
 * <MonthlySalesBranches selectedDateRange={partialMonthRange} /> // Returns null
 * ```
 *
 * @see {@link DateRange} for date range structure details
 * @see {@link BranchSalesData} for branch data structure
 * @see {@link useMonthlyBranches} for API integration logic
 */
export interface MonthlySalesBranchesProps {
    selectedDateRange?: DateRange;
}

/**
 * Props interface for individual BranchCollapsibleItem components (monthly version).
 * Defines the data needed to render a single branch as an independent collapsible.
 *
 * @interface BranchCollapsibleItemProps
 * @property {BranchSalesData} branch - Complete branch sales data object
 * @property {boolean} isCurrentMonth - Whether the selected month is the current month
 *
 * @description This interface ensures type safety for individual branch collapsible items.
 * Unlike accordion items, collapsibles don't require a value prop since each operates independently.
 * For monthly view, isCurrentMonth determines whether to show open accounts (always false for monthly).
 *
 * @example
 * ```tsx
 * // Typical usage within map iteration
 * {branches.map((branch) => (
 *   <BranchCollapsibleItem
 *     key={branch.id}
 *     branch={branch}
 *     isCurrentMonth={isCurrentMonth}
 *   />
 * ))}
 * ```
 *
 * @see {@link BranchSalesData} for branch data structure
 * @see {@link MonthlySalesBranches} for parent component usage
 */
export interface BranchCollapsibleItemProps {
    branch: BranchSalesData;
    isCurrentMonth: boolean;
}

/**
 * Return type for the useMonthlyBranches hook.
 * Provides state and methods for managing monthly branches data.
 */
export interface UseMonthlyBranchesReturn {
    branchesData: BranchSalesData[];
    isLoading: boolean;
    error: string | null;
    isValidCompleteMonth: boolean;
    isCurrentMonth: boolean;
    refetch: () => void;
}

/**
 * Props interface for the MonthlyBranchesError component.
 * Defines error display and retry functionality.
 */
export interface MonthlyBranchesErrorProps {
    error: string;
    onRetry?: () => void;
}

/**
 * Interface for API card data structure from the monthly chart service.
 * Defines the raw data format returned by the API.
 */
export interface ApiCardData {
    store_id: number;
    open_accounts: {
        total: number;
        money: number;
    };
    closed_ticket: {
        total: number;
        money: number;
    };
    last_sales: number;
    average_ticket: number;
    percentage: {
        icon: string;
        qty: number;
    };
    brand: string;
    region: string;
}
