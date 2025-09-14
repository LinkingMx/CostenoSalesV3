/**
 * Service-specific Types
 * Types for hours chart service and related functionality
 */

// API Request/Response Types
export interface HoursChartRequest {
  date: string; // Format: YYYY-MM-DD
}

export interface HourlyData {
  hour: string;
  value: number;
}

export interface DayData {
  date: string;
  hours: HourlyData[];
  total?: number; // Will be calculated from hours
}

export interface HoursChartApiResponse {
  success: boolean;
  data: DayData[];
}

// Processed Data Types for Chart
export interface ProcessedDayData {
  label: string; // "Hoy", "Ayer", etc.
  date: string;
  total: number;
}

export interface ProcessedChartData {
  days: ProcessedDayData[];
  isEmpty: boolean;
  hasError: boolean;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string;
}

// Service Response Types
export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  isLoading: boolean;
  isFromCache?: boolean;
}

// Main Dashboard API Types
export interface MainDashboardRequest {
  start_date: string; // Format: YYYY-MM-DD
  end_date: string;   // Format: YYYY-MM-DD
}

export interface PercentageIndicator {
  icon: 'up' | 'down';
  qty: string; // Percentage as string (e.g., "22.5")
}

export interface AccountData {
  total: number;  // Number of accounts/tickets
  money: number;  // Total money amount
}

export interface BranchApiData {
  open_accounts: AccountData;
  closed_ticket: AccountData;
  average_ticket: number;
  percentage: PercentageIndicator;
  date: string;      // Last update timestamp
  store_id: number;  // Store ID for detail navigation
  brand: string;     // Brand name for filtering
  region: string;    // Region for filtering
}

export interface SalesData {
  total: number;     // Total sales with tax
  subtotal: number;  // Sales without tax
}

export interface MainDashboardApiResponse {
  success: boolean;
  data: {
    sales: SalesData;
    cards: Record<string, BranchApiData>; // Key is branch name like "Animal (CDMX)"
  };
  message?: string;
  error?: string;
}