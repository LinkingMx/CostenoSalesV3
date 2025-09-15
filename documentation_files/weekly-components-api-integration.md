# Weekly Components API Integration Documentation

## Overview

This document defines the comprehensive API integration strategy for all weekly-based components in CostenoSalesV3. The system provides real-time sales data for week-based analysis and comparison across multiple restaurant locations, supporting both chart visualizations and detailed branch comparisons.

## 🎯 Scope & Components

### Affected Weekly Components
- **`weekly-chart-comparison`**: 3-week daily sales comparison line chart
- **`weekly-sales-comparison`**: Weekly sales comparison cards
- **`weekly-sales-branches`**: Branch performance analysis for weekly periods
- **Future weekly components**: Extensible architecture for new weekly features

### Business Context
- **Week Definition**: Monday to Sunday (7 consecutive days)
- **Comparison Periods**: Current week vs. previous week vs. two weeks ago
- **Currency**: Mexican Pesos (MXN)
- **Timezone**: Mexico local time
- **Update Frequency**: Real-time data with last synchronization timestamps

---

## 📡 API Endpoint Specification

### Base Configuration
```typescript
const API_CONFIG = {
  baseURL: 'http://192.168.100.20',
  endpoint: '/api/main_dashboard_data',
  method: 'POST',
  timeout: 30000,
  retries: 3
};

const STATIC_TOKEN = '342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f';
```

### Request Structure
```typescript
interface WeeklyDataRequest {
  start_date: string;    // YYYY-MM-DD format (Monday)
  end_date: string;      // YYYY-MM-DD format (Sunday)
  range: 'week';         // Fixed value for weekly data
}

// Example request
const requestBody: WeeklyDataRequest = {
  start_date: '2025-08-25',  // Monday
  end_date: '2025-08-31',    // Sunday
  range: 'week'
};
```

### Headers Configuration
```typescript
const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${STATIC_TOKEN}`
};
```

### Complete Request Example
```javascript
const requestOptions = {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f'
  },
  body: JSON.stringify({
    start_date: '2025-08-25',
    end_date: '2025-08-31',
    range: 'week'
  }),
  redirect: 'follow'
};

fetch('http://192.168.100.20/api/main_dashboard_data', requestOptions)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('API Error:', error));
```

---

## 🏗️ API Response Structure

### Root Response Interface
```typescript
interface WeeklyDashboardResponse {
  success: boolean;
  message: string;
  data: WeeklyDashboardData;
}

interface WeeklyDashboardData {
  sales: SalesTotals;
  cards: BranchesData;
  range: WeeklyRangeData;
}
```

### Sales Totals
```typescript
interface SalesTotals {
  total: number;      // Total sales including taxes (MXN)
  subtotal: number;   // Sales without taxes (MXN)
}

// Example
{
  "sales": {
    "total": 59503359,     // $59,503,359 MXN
    "subtotal": 51295999   // $51,295,999 MXN
  }
}
```

### Branch Data Structure
```typescript
interface BranchesData {
  [branchName: string]: BranchWeeklyData;
}

interface BranchWeeklyData {
  open_accounts: AccountsInfo;
  closed_ticket: TicketInfo;
  last_sales: number;                    // Previous week sales (MXN)
  average_ticket: number;                // Average ticket amount (MXN)
  percentage: PercentageChange;
  date: string;                          // Last update timestamp
  store_id: number;                      // Unique store identifier
  last_synchronization: string;          // ISO timestamp
  brand: string;                         // Restaurant brand name
  region: string;                        // Geographic region code
  operational_address: string | null;    // Physical address
  general_address: string | null;        // Mailing address
}

interface AccountsInfo {
  total: number;    // Number of open accounts
  money: number;    // Total amount in open accounts (MXN)
}

interface TicketInfo {
  total: number;    // Number of closed tickets
  money: number;    // Total amount from closed tickets (MXN)
}

interface PercentageChange {
  icon: 'up' | 'down';    // Trend direction indicator
  qty: number;            // Percentage change vs previous week
}
```

### Weekly Range Data (3-Week Comparison)
```typescript
interface WeeklyRangeData {
  actual: DailyAmountsMap;      // Current selected week
  last: DailyAmountsMap;        // Previous week
  two_last: DailyAmountsMap;    // Two weeks ago
}

interface DailyAmountsMap {
  [dateString: string]: number;  // YYYY-MM-DD: amount in MXN
}

// Example structure
{
  "range": {
    "actual": {
      "2025-08-25": 4337259.37,    // Monday
      "2025-08-26": 6074341.28,    // Tuesday
      "2025-08-27": 11491298.84,   // Wednesday
      "2025-08-28": 8166555.62,    // Thursday
      "2025-08-29": 10146745.57,   // Friday
      "2025-08-30": 11553602.03,   // Saturday
      "2025-08-31": 7752705.1      // Sunday
    },
    "last": {
      "2025-08-18": 4313279.54,    // Previous Monday
      "2025-08-19": 6238484.82,    // Previous Tuesday
      // ... rest of previous week
    },
    "two_last": {
      "2025-08-11": 4239247.1,     // Two weeks ago Monday
      "2025-08-12": 6191199.47,    // Two weeks ago Tuesday
      // ... rest of two weeks ago
    }
  }
}
```

---

## 🔄 Data Mapping Strategies

### For WeeklyChartComparison Component
```typescript
// Transform API response to chart data format
interface ChartDataMapping {
  source: WeeklyRangeData;
  target: WeeklyChartData;
}

const mapToChartData = (rangeData: WeeklyRangeData): WeeklyChartData => {
  const dailyData: ChartDayData[] = [];

  // Map each day of the week (Monday to Sunday)
  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const spanishDayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  const fullSpanishDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Get sorted date arrays for each week
  const actualDates = Object.keys(rangeData.actual).sort();
  const lastDates = Object.keys(rangeData.last).sort();
  const twoLastDates = Object.keys(rangeData.two_last).sort();

  for (let i = 0; i < 7; i++) {
    dailyData.push({
      dayName: spanishDayNames[i],
      fullDayName: fullSpanishDayNames[i],
      week1: rangeData.actual[actualDates[i]] || 0,
      week2: rangeData.last[lastDates[i]] || 0,
      week3: rangeData.two_last[twoLastDates[i]] || 0
    });
  }

  return {
    dailyData,
    weekLabels: ['Semana Actual', 'Semana Anterior', 'Hace 2 Semanas'],
    weekColors: ['#897053', '#6b5d4a', '#4a3d2f']
  };
};
```

### For WeeklySalesComparison Component
```typescript
// Transform API range data to weekly sales format
const mapToWeeklySalesData = (rangeData: WeeklyRangeData): SalesWeekData[] => {
  const weeklyData: SalesWeekData[] = [];

  // Calculate week totals
  const actualTotal = Object.values(rangeData.actual).reduce((sum, amount) => sum + amount, 0);
  const lastTotal = Object.values(rangeData.last).reduce((sum, amount) => sum + amount, 0);
  const twoLastTotal = Object.values(rangeData.two_last).reduce((sum, amount) => sum + amount, 0);

  // Get week start dates
  const actualStartDate = new Date(Object.keys(rangeData.actual).sort()[0]);
  const lastStartDate = new Date(Object.keys(rangeData.last).sort()[0]);
  const twoLastStartDate = new Date(Object.keys(rangeData.two_last).sort()[0]);

  weeklyData.push(
    {
      date: actualStartDate,
      amount: actualTotal,
      isCurrentWeek: true,
      dayName: 'Semana Actual'
    },
    {
      date: lastStartDate,
      amount: lastTotal,
      isCurrentWeek: false,
      dayName: 'Semana Anterior'
    },
    {
      date: twoLastStartDate,
      amount: twoLastTotal,
      isCurrentWeek: false,
      dayName: 'Hace 2 Semanas'
    }
  );

  return weeklyData;
};
```

### For WeeklySalesBranches Component
```typescript
// Transform API cards data to branch sales format
const mapToBranchSalesData = (cardsData: BranchesData): BranchWeeklyData[] => {
  return Object.entries(cardsData).map(([branchName, branchData]) => ({
    id: branchData.store_id.toString(),
    name: branchName,
    location: branchData.region,
    brand: branchData.brand,
    totalSales: branchData.closed_ticket.money,
    previousWeekSales: branchData.last_sales,
    percentage: branchData.percentage.qty,
    percentageIcon: branchData.percentage.icon,
    openAccounts: branchData.open_accounts.money,
    closedSales: branchData.closed_ticket.money,
    averageTicket: branchData.average_ticket,
    totalTickets: branchData.closed_ticket.total,
    lastUpdate: new Date(branchData.last_synchronization),
    avatar: branchData.brand.charAt(0).toUpperCase()
  }));
};
```

---

## 🛠️ Service Layer Architecture

### Base Weekly Service Structure
```typescript
// weekly-data.service.ts
export class WeeklyDataService {
  private static readonly BASE_URL = 'http://192.168.100.20';
  private static readonly ENDPOINT = '/api/main_dashboard_data';
  private static readonly TOKEN = '342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f';

  private static readonly DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.TOKEN}`
  };

  /**
   * Fetch weekly dashboard data for a specific week range
   */
  static async fetchWeeklyData(
    startDate: Date,
    endDate: Date
  ): Promise<WeeklyDashboardResponse> {
    const requestBody: WeeklyDataRequest = {
      start_date: this.formatDateForAPI(startDate),
      end_date: this.formatDateForAPI(endDate),
      range: 'week'
    };

    try {
      const response = await fetch(`${this.BASE_URL}${this.ENDPOINT}`, {
        method: 'POST',
        headers: this.DEFAULT_HEADERS,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: WeeklyDashboardResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('WeeklyDataService: API request failed', error);
      throw new Error(`Failed to fetch weekly data: ${error.message}`);
    }
  }

  /**
   * Format date to API-required YYYY-MM-DD format
   */
  private static formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Validate that the date range represents exactly one week (Monday to Sunday)
   */
  static validateWeekRange(startDate: Date, endDate: Date): boolean {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Must be exactly 6 days difference (Monday to Sunday)
    if (diffDays !== 6) return false;

    // Start date must be Monday (getDay() === 1)
    if (startDate.getDay() !== 1) return false;

    // End date must be Sunday (getDay() === 0)
    if (endDate.getDay() !== 0) return false;

    return true;
  }

  /**
   * Get the Monday of the week containing the given date
   */
  static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  }

  /**
   * Get the Sunday of the week containing the given date
   */
  static getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  }
}
```

### Specialized Component Services
```typescript
// weekly-chart.service.ts
export class WeeklyChartService extends WeeklyDataService {
  /**
   * Fetch and transform data specifically for weekly chart comparison
   */
  static async fetchChartData(selectedWeek: Date): Promise<WeeklyChartData> {
    const weekStart = this.getWeekStart(selectedWeek);
    const weekEnd = this.getWeekEnd(selectedWeek);

    if (!this.validateWeekRange(weekStart, weekEnd)) {
      throw new Error('Invalid week range: Must be Monday to Sunday');
    }

    const response = await this.fetchWeeklyData(weekStart, weekEnd);
    return this.transformToChartData(response.data.range);
  }

  private static transformToChartData(rangeData: WeeklyRangeData): WeeklyChartData {
    // Implementation of mapToChartData function from above
    return mapToChartData(rangeData);
  }
}

// weekly-sales.service.ts
export class WeeklySalesService extends WeeklyDataService {
  /**
   * Fetch and transform data for weekly sales comparison
   */
  static async fetchSalesData(selectedWeek: Date): Promise<SalesWeekData[]> {
    const weekStart = this.getWeekStart(selectedWeek);
    const weekEnd = this.getWeekEnd(selectedWeek);

    const response = await this.fetchWeeklyData(weekStart, weekEnd);
    return this.transformToSalesData(response.data.range);
  }

  private static transformToSalesData(rangeData: WeeklyRangeData): SalesWeekData[] {
    return mapToWeeklySalesData(rangeData);
  }
}

// weekly-branches.service.ts
export class WeeklyBranchesService extends WeeklyDataService {
  /**
   * Fetch and transform data for weekly branch analysis
   */
  static async fetchBranchesData(selectedWeek: Date): Promise<BranchWeeklyData[]> {
    const weekStart = this.getWeekStart(selectedWeek);
    const weekEnd = this.getWeekEnd(selectedWeek);

    const response = await this.fetchWeeklyData(weekStart, weekEnd);
    return this.transformToBranchData(response.data.cards);
  }

  private static transformToBranchData(cardsData: BranchesData): BranchWeeklyData[] {
    return mapToBranchSalesData(cardsData);
  }
}
```

---

## 🔗 React Hook Integration

### Base Weekly Hook
```typescript
// use-weekly-data.ts
export interface UseWeeklyDataOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  debounceMs?: number;
  onApiStart?: () => void;
  onSuccess?: (data: WeeklyDashboardData) => void;
  onError?: (error: string) => void;
}

export interface UseWeeklyDataReturn {
  data: WeeklyDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isValidForWeeklyComponents: boolean;
}

export const useWeeklyData = (
  selectedDateRange: DateRange | undefined,
  options: UseWeeklyDataOptions = {}
): UseWeeklyDataReturn => {
  // Similar structure to useHoursChart but for weekly data
  // Implementation details...
};
```

### Specialized Component Hooks
```typescript
// use-weekly-chart.ts
export const useWeeklyChart = (
  selectedDateRange: DateRange | undefined,
  options: UseWeeklyDataOptions = {}
): UseWeeklyChartReturn => {
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
    clearCache,
    isValidForWeeklyComponents
  } = useWeeklyData(selectedDateRange, options);

  const chartData = useMemo(() => {
    if (!apiData?.range) return null;
    return WeeklyChartService.transformToChartData(apiData.range);
  }, [apiData]);

  return {
    data: chartData,
    isLoading,
    error,
    refetch,
    clearCache,
    isValidForWeeklyComponents
  };
};

// use-weekly-sales.ts
export const useWeeklySales = (
  selectedDateRange: DateRange | undefined,
  options: UseWeeklyDataOptions = {}
): UseWeeklySalesReturn => {
  // Similar pattern for sales data
};

// use-weekly-branches.ts
export const useWeeklyBranches = (
  selectedDateRange: DateRange | undefined,
  options: UseWeeklyDataOptions = {}
): UseWeeklyBranchesReturn => {
  // Similar pattern for branches data
};
```

---

## 📊 Context Provider Architecture

### Shared Weekly Context
```typescript
// weekly-data-context.tsx
interface WeeklyDataContextValue {
  data: WeeklyDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
  isValidForWeeklyComponents: boolean;
}

const WeeklyDataContext = createContext<WeeklyDataContextValue | null>(null);

export const WeeklyDataProvider: React.FC<{
  children: ReactNode;
  selectedDateRange: DateRange | undefined;
}> = ({ children, selectedDateRange }) => {
  const sharedData = useWeeklyData(selectedDateRange, {
    enableRetry: true,
    maxRetries: 3,
    debounceMs: 300
  });

  return (
    <WeeklyDataContext.Provider value={sharedData}>
      {children}
    </WeeklyDataContext.Provider>
  );
};

export const useWeeklyDataContext = (): WeeklyDataContextValue => {
  const context = useContext(WeeklyDataContext);
  if (!context) {
    throw new Error('useWeeklyDataContext must be used within a WeeklyDataProvider');
  }
  return context;
};
```

---

## 🎯 Component Integration Examples

### WeeklyChartComparison Integration
```typescript
// Updated weekly-chart-comparison.tsx
export function WeeklyChartComparison({
  selectedDateRange,
  chartData
}: WeeklyChartComparisonProps) {
  // Use the weekly chart context
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
    isValidForWeeklyComponents
  } = useWeeklyChartContext();

  // Transform API data to chart format
  const displayData = useMemo((): WeeklyChartData | null => {
    if (!isValidForWeeklyComponents) return null;

    if (chartData) {
      return chartData; // Use provided data
    }

    if (apiData?.range) {
      return WeeklyChartService.transformToChartData(apiData.range);
    }

    return null;
  }, [isValidForWeeklyComponents, chartData, apiData]);

  // Loading state
  if (isLoading && !chartData) {
    return <WeeklyChartSkeleton />;
  }

  // Error state
  if (error && !chartData) {
    return <WeeklyChartError error={error} onRetry={refetch} />;
  }

  // Rest of component implementation...
}
```

### Dashboard Integration
```typescript
// dashboard.tsx integration
function Dashboard() {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>();

  return (
    <div className="space-y-4">
      <MainFilterCalendar
        value={selectedDateRange}
        onChange={setSelectedDateRange}
      />

      {/* Weekly components with shared context */}
      <WeeklyDataProvider selectedDateRange={selectedDateRange}>
        <WeeklyChartComparison selectedDateRange={selectedDateRange} />
        <WeeklySalesComparison selectedDateRange={selectedDateRange} />
        <WeeklySalesBranches selectedDateRange={selectedDateRange} />
      </WeeklyDataProvider>
    </div>
  );
}
```

---

## 🔍 Validation & Error Handling

### Date Range Validation
```typescript
export const validateWeeklyDateRange = (dateRange: DateRange | undefined): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!dateRange?.from || !dateRange?.to) {
    errors.push('Both start and end dates are required for weekly data');
    return { isValid: false, errors, warnings, metadata: { validatedAt: new Date(), source: 'weekly-date-validation' } };
  }

  // Validate Monday to Sunday requirement
  if (!WeeklyDataService.validateWeekRange(dateRange.from, dateRange.to)) {
    errors.push('Week range must be exactly Monday to Sunday (7 days)');
  }

  // Validate future dates
  const today = new Date();
  if (dateRange.to > today) {
    warnings.push('Selected week includes future dates - data may be incomplete');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: new Date(),
      source: 'weekly-date-validation',
      rangeDays: Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    }
  };
};
```

### API Response Validation
```typescript
export const validateWeeklyApiResponse = (response: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate response structure
  if (!response.success) {
    errors.push(`API request failed: ${response.message || 'Unknown error'}`);
  }

  if (!response.data) {
    errors.push('API response missing data field');
    return { isValid: false, errors, warnings, metadata: { validatedAt: new Date(), source: 'api-response-validation' } };
  }

  // Validate required data sections
  if (!response.data.range) {
    errors.push('API response missing range data');
  }

  if (!response.data.cards) {
    warnings.push('API response missing cards data - branch components may not work');
  }

  // Validate range data structure
  if (response.data.range) {
    const { actual, last, two_last } = response.data.range;

    if (!actual || Object.keys(actual).length !== 7) {
      errors.push('Range.actual must contain exactly 7 days of data');
    }

    if (!last || Object.keys(last).length !== 7) {
      errors.push('Range.last must contain exactly 7 days of data');
    }

    if (!two_last || Object.keys(two_last).length !== 7) {
      errors.push('Range.two_last must contain exactly 7 days of data');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: new Date(),
      source: 'api-response-validation',
      hasRangeData: !!response.data.range,
      hasCardsData: !!response.data.cards,
      cardCount: response.data.cards ? Object.keys(response.data.cards).length : 0
    }
  };
};
```

---

## 🚀 Performance Optimizations

### Caching Strategy
```typescript
// weekly-cache.service.ts
export class WeeklyCacheService {
  private static cache = new Map<string, {
    data: WeeklyDashboardData;
    timestamp: number;
    expiresAt: number;
  }>();

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static generateCacheKey(startDate: Date, endDate: Date): string {
    return `weekly_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
  }

  static get(startDate: Date, endDate: Date): WeeklyDashboardData | null {
    const key = this.generateCacheKey(startDate, endDate);
    const cached = this.cache.get(key);

    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static set(startDate: Date, endDate: Date, data: WeeklyDashboardData): void {
    const key = this.generateCacheKey(startDate, endDate);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  static clear(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate) {
      const key = this.generateCacheKey(startDate, endDate);
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
```

### Request Deduplication
```typescript
// weekly-request-manager.ts
export class WeeklyRequestManager {
  private static pendingRequests = new Map<string, Promise<WeeklyDashboardResponse>>();

  static async getWeeklyData(startDate: Date, endDate: Date): Promise<WeeklyDashboardResponse> {
    const cacheKey = WeeklyCacheService.generateCacheKey(startDate, endDate);

    // Check cache first
    const cached = WeeklyCacheService.get(startDate, endDate);
    if (cached) {
      return { success: true, message: '', data: cached };
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make new request
    const requestPromise = WeeklyDataService.fetchWeeklyData(startDate, endDate);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful response
      if (response.success) {
        WeeklyCacheService.set(startDate, endDate, response.data);
      }

      return response;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
    }
  }
}
```

---

## 📱 Mobile & Responsive Considerations

### Optimized Data Loading
```typescript
// mobile-weekly.service.ts
export class MobileWeeklyService extends WeeklyDataService {
  /**
   * Fetch minimal data for mobile devices
   */
  static async fetchMobileOptimizedData(selectedWeek: Date): Promise<MobileWeeklyData> {
    const fullData = await this.fetchWeeklyData(
      this.getWeekStart(selectedWeek),
      this.getWeekEnd(selectedWeek)
    );

    // Return only essential data for mobile
    return {
      totalSales: fullData.data.sales.total,
      chartData: this.getSimplifiedChartData(fullData.data.range),
      topBranches: this.getTopBranches(fullData.data.cards, 5), // Only top 5
      weekComparison: this.getWeekTotals(fullData.data.range)
    };
  }

  private static getSimplifiedChartData(rangeData: WeeklyRangeData): SimpleChartData {
    // Simplified chart data with fewer data points for mobile
    return {
      currentWeek: Object.values(rangeData.actual),
      previousWeek: Object.values(rangeData.last),
      labels: ['L', 'M', 'M', 'J', 'V', 'S', 'D'] // Abbreviated labels
    };
  }
}
```

---

## 🔮 Future Enhancements

### Planned API Improvements
1. **Real-time Updates**: WebSocket integration for live data
2. **Batch Requests**: Multiple week ranges in single request
3. **Filtering Options**: Region, brand, store-specific filters
4. **Export Capabilities**: CSV, PDF export endpoints
5. **Historical Data**: Extended date range support

### Performance Enhancements
1. **Incremental Loading**: Partial data loading for large datasets
2. **Background Sync**: Service worker data synchronization
3. **Predictive Caching**: Pre-load adjacent weeks
4. **Compression**: Response compression for mobile networks

---

## 📋 Implementation Checklist

### Phase 1: Core Service Layer
- [ ] Implement `WeeklyDataService` base class
- [ ] Create specialized service classes for each component
- [ ] Add comprehensive error handling and validation
- [ ] Implement caching and request deduplication

### Phase 2: React Integration
- [ ] Create base `useWeeklyData` hook
- [ ] Implement specialized hooks for each component
- [ ] Create shared context provider
- [ ] Add loading and error state management

### Phase 3: Component Updates
- [ ] Update `weekly-chart-comparison` with API integration
- [ ] Update `weekly-sales-comparison` with real data
- [ ] Update `weekly-sales-branches` with API consumption
- [ ] Add loading skeletons and error states

### Phase 4: Testing & Optimization
- [ ] Add comprehensive unit tests
- [ ] Implement integration testing
- [ ] Performance testing and optimization
- [ ] Mobile responsiveness testing

### Phase 5: Documentation & Deployment
- [ ] Complete API documentation
- [ ] Create usage examples and guides
- [ ] Deploy to staging environment
- [ ] Production deployment and monitoring

---

**Last Updated**: December 2024
**API Version**: 1.0.0
**Document Version**: 1.0.0
**Maintainer**: CostenoSalesV3 Development Team