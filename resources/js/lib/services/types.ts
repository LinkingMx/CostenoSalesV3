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