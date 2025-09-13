import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Comprehensive sales data interface for a single branch location in custom date ranges.
 * Contains all metrics needed to display detailed branch performance in Spanish-localized UI.
 * 
 * @interface BranchCustomSalesData
 * @property {string} id - Unique branch identifier (typically numeric but stored as string)
 * @property {string} name - Human-readable branch name displayed in the UI
 * @property {string} [location] - Optional branch location/city for additional context
 * @property {number} totalSales - Total sales amount in Mexican pesos (MXN)
 * @property {number} percentage - Growth percentage (positive/negative) for period comparison
 * @property {number} openAccounts - Total amount from pending/open transactions
 * @property {number} closedSales - Total amount from completed transactions
 * @property {number} averageTicket - Average transaction amount per ticket
 * @property {number} totalTickets - Total number of transactions/tickets processed
 * @property {string} avatar - Single character identifier for branch visual display
 *
 * @description This interface represents the core data structure for branch sales analytics
 * for custom date ranges. All monetary values are expected to be in Mexican pesos (MXN) and will be formatted 
 * using Spanish locale conventions (es-MX) for consistent presentation.
 * 
 * @example
 * ```tsx
 * const branchData: BranchCustomSalesData = {
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
export interface BranchCustomSalesData {
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
 * Props interface for the CustomSalesBranches component.
 * Provides configuration options for displaying branch sales data with conditional visibility.
 * 
 * @interface CustomSalesBranchesProps
 * @property {DateRange} [selectedDateRange] - Current date selection from main filter calendar
 * @property {BranchCustomSalesData[]} [branches=DUMMY_CUSTOM_BRANCHES_DATA] - Array of branch sales data to display
 * 
 * @description This interface defines the external API for the CustomSalesBranches component.
 * The component uses conditional rendering based on the selectedDateRange to ensure
 * data relevance - it only displays when a custom range (not single day, complete week, or complete month) is selected.
 * 
 * @example
 * ```tsx
 * // Controlled usage with real data
 * <CustomSalesBranches 
 *   selectedDateRange={customRange}
 *   branches={liveBranchData}
 * />
 * 
 * // Default usage with dummy data (development)
 * <CustomSalesBranches selectedDateRange={dateRange} />
 * 
 * // Will not render when not custom range selected
 * <CustomSalesBranches selectedDateRange={singleDayRange} /> // Returns null
 * ```
 * 
 * @see {@link DateRange} for date range structure details
 * @see {@link BranchCustomSalesData} for branch data structure
 * @see {@link isCustomRangeSelected} for visibility logic
 */
export interface CustomSalesBranchesProps {
  selectedDateRange?: DateRange;
  branches?: BranchCustomSalesData[];
}

/**
 * Props interface for individual BranchCustomCollapsibleItem components.
 * Defines the data needed to render a single branch as an independent collapsible.
 * 
 * @interface BranchCustomCollapsibleItemProps
 * @property {BranchCustomSalesData} branch - Complete branch sales data object
 * 
 * @description This interface ensures type safety for individual branch collapsible items
 * for custom date ranges. Unlike accordion items, collapsibles don't require a value prop 
 * since each operates independently.
 * 
 * @example
 * ```tsx
 * // Typical usage within map iteration
 * {branches.map((branch) => (
 *   <BranchCustomCollapsibleItem
 *     key={branch.id}
 *     branch={branch}
 *   />
 * ))}
 * ```
 * 
 * @see {@link BranchCustomSalesData} for branch data structure
 * @see {@link CustomSalesBranches} for parent component usage
 */
export interface BranchCustomCollapsibleItemProps {
  branch: BranchCustomSalesData;
}

/**
 * Props interface for CustomSalesBranchesHeader component.
 * 
 * @interface CustomSalesBranchesHeaderProps
 * @property {string} [title] - Optional custom title override
 * @property {string} [subtitle] - Optional custom subtitle override
 * 
 * @description Configuration for the header component of custom sales branches.
 * 
 * @example
 * ```tsx
 * <CustomSalesBranchesHeader 
 *   title="Ventas por sucursal"
 *   subtitle="Rango seleccionado"
 * />
 * ```
 */
export interface CustomSalesBranchesHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Metrics interface for aggregated custom branch sales data.
 * Contains calculated summaries and statistics for multiple branches.
 */
export interface CustomBranchMetrics {
  totalBranches: number;
  totalSales: number;
  averageBranchSales: number;
  topBranchId: string;
  topBranchName: string;
  topBranchSales: number;
  totalTickets: number;
  averageTicketValue: number;
  dateRange: DateRange;
  rangeDays: number;
}