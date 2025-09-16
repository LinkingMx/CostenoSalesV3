/**
 * Branch Details API Service
 * Handles API calls for store/branch details data
 */

import type { DateRange } from '@/components/main-filter-calendar';

// API Response interfaces
export interface StoreDetailsRequest {
  start_date: string;  // Formato: "YYYY-MM-DD"
  end_date: string;    // Formato: "YYYY-MM-DD"
  store_id: number;    // ID de la sucursal
}

export interface SalesCategory {
  money: number;           // Ventas en dinero (pesos mexicanos)
  percentage: number;      // Porcentaje del total de ventas
}

export interface TicketInfo {
  open: number;            // Número de cuentas abiertas
  open_money: number;      // Dinero en cuentas abiertas
  closed: number;          // Número de cuentas cerradas
  closed_money: number;    // Dinero en cuentas cerradas
}

export interface AverageMetrics {
  ticket: number;          // Ticket promedio
  diners: number;          // Promedio por comensal
}

export interface TopProduct {
  item_id: number;         // ID único del producto
  name: string;            // Nombre del producto
  quantity: number;        // Cantidad vendida (puede ser decimal para productos por kg)
  unit_cost: number;       // Precio unitario en pesos
  percentage: number;      // Porcentaje de participación en ventas
}

export interface StoreData {
  // Métricas de comensales
  diners: number;           // Total de comensales
  total_diners: number;     // Comensales totales (duplicado de diners)

  // Información de la sucursal
  brand: string;           // Marca (ej: "MOCHOMOS")
  region: string;          // Región (ej: "VS-OG")
  operational_address: string | null;
  general_address: string | null;

  // Métricas de ventas por categoría
  food: SalesCategory;     // Ventas de alimentos
  drinks: SalesCategory;   // Ventas de bebidas
  others: SalesCategory;   // Ventas de vinos

  // Información de tickets/cuentas
  ticket: TicketInfo;

  // Promedios
  average: AverageMetrics;

  // Descuentos aplicados
  discounts: number;       // Importe total de descuentos

  // Top productos vendidos
  top_products: TopProduct[];
}

export interface StoreDetailsResponse {
  success: boolean;
  message: string;
  data: StoreData;
}

/**
 * Format date to YYYY-MM-DD for API
 */
function formatDateForApi(date: Date): string {
  // Ensure we're working with a valid Date object
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided for API formatting');
  }

  // Use local date to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Build request payload for store details API
 */
function buildStoreDetailsRequest(
  storeId: number,
  dateRange: DateRange
): StoreDetailsRequest {
  if (!dateRange.from || !dateRange.to) {
    throw new Error('Date range is required for store details request');
  }

  return {
    start_date: formatDateForApi(dateRange.from),
    end_date: formatDateForApi(dateRange.to),
    store_id: storeId
  };
}

/**
 * Fetch store details from API
 */
export async function fetchStoreDetails(
  storeId: number,
  dateRange: DateRange,
  options: {
    signal?: AbortSignal;
    retries?: number;
  } = {}
): Promise<StoreData> {
  const { signal, retries = 3 } = options;

  const requestPayload = buildStoreDetailsRequest(storeId, dateRange);

  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Branch Details API Request:', {
      storeId,
      dateRange: {
        from: dateRange.from?.toISOString(),
        to: dateRange.to?.toISOString()
      },
      payload: requestPayload
    });
  }

  let lastError: Error = new Error('No attempts were made');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch('http://192.168.100.20/api/get_store_details', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f'
        },
        body: JSON.stringify(requestPayload),
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: StoreDetailsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'API returned success: false');
      }

      // Validate and log the actual data
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 Branch Details API Raw Response:', {
          success: result.success,
          message: result.message,
          dataKeys: result.data ? Object.keys(result.data) : [],
          food: result.data?.food,
          drinks: result.data?.drinks,
          others: result.data?.others,
          diners: result.data?.diners,
          ticket: result.data?.ticket,
          average: result.data?.average
        });

        const totalSales = (result.data?.food?.money || 0) +
                          (result.data?.drinks?.money || 0) +
                          (result.data?.others?.money || 0);

        console.log('✅ Branch Details API Success:', {
          storeId,
          totalSales,
          diners: result.data?.diners || 0,
          topProductsCount: result.data?.top_products?.length || 0,
          brand: result.data?.brand,
          region: result.data?.region
        });

        // Warn if data seems empty
        if (totalSales === 0) {
          console.warn('⚠️ Branch Details API returned 0 sales. This might indicate:', [
            '1. No sales data exists for this date range',
            '2. The store_id might be incorrect',
            '3. The date format might not match what the API expects',
            'Request payload was:', requestPayload
          ]);
        }
      }

      // Ensure we always return valid data structure
      return {
        ...result.data,
        food: result.data?.food || { money: 0, percentage: 0 },
        drinks: result.data?.drinks || { money: 0, percentage: 0 },
        others: result.data?.others || { money: 0, percentage: 0 },
        diners: result.data?.diners || 0,
        total_diners: result.data?.total_diners || result.data?.diners || 0,
        top_products: result.data?.top_products || []
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (signal?.aborted) {
        throw new Error('Request was aborted');
      }

      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Branch Details API attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Branch Details API failed after all retries:', lastError);
        }
      }
    }
  }

  throw lastError;
}

/**
 * Cache for branch details requests (simple in-memory cache)
 */
class BranchDetailsCache {
  private cache = new Map<string, { data: StoreData; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(storeId: number, dateRange: DateRange): string {
    const from = dateRange.from?.toISOString().split('T')[0] || '';
    const to = dateRange.to?.toISOString().split('T')[0] || '';
    return `${storeId}-${from}-${to}`;
  }

  get(storeId: number, dateRange: DateRange): StoreData | null {
    const key = this.getCacheKey(storeId, dateRange);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 Branch Details Cache Hit:', key);
      }
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  set(storeId: number, dateRange: DateRange, data: StoreData): void {
    const key = this.getCacheKey(storeId, dateRange);
    this.cache.set(key, { data, timestamp: Date.now() });

    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Branch Details Cache Set:', key);
    }
  }

  clear(): void {
    this.cache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Branch Details Cache Cleared');
    }
  }
}

export const branchDetailsCache = new BranchDetailsCache();

/**
 * Fetch store details with caching
 */
export async function fetchStoreDetailsWithCache(
  storeId: number,
  dateRange: DateRange,
  options: {
    signal?: AbortSignal;
    retries?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<StoreData> {
  const { forceRefresh = false, ...fetchOptions } = options;

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = branchDetailsCache.get(storeId, dateRange);
    if (cached) {
      return cached;
    }
  }

  // Fetch from API
  const data = await fetchStoreDetails(storeId, dateRange, fetchOptions);

  // Cache the result
  branchDetailsCache.set(storeId, dateRange, data);

  return data;
}