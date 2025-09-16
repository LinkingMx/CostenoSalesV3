# Daily Sales Comparison - API Integration

## Overview

The `daily-sales-comparison` component has been successfully integrated with the `useHoursChart` hook to share the same API call with `daily-chart-comparison` component. This prevents duplicate API requests and ensures data consistency across both components.

## Integration Architecture

### Data Flow

```
Selected Date (from MainFilterCalendar)
    ↓
useHoursChart Hook (shared)
    ↓
API Call: get-hours-chart (single request)
    ↓
ProcessedChartData (cached response)
    ↓
┌─────────────────────┬─────────────────────┐
│ daily-chart-comparison │ daily-sales-comparison │
└─────────────────────┴─────────────────────┘
```

### Key Components

#### 1. Shared Hook: `useHoursChart`

- **Location**: `/resources/js/hooks/use-hours-chart.ts`
- **Features**:
    - Caching mechanism to prevent duplicate API calls
    - Retry logic for failed requests
    - Debouncing to optimize API calls
    - Loading and error state management

#### 2. Data Converter Function

- **Function**: `convertProcessedChartDataToSalesData`
- **Location**: `/resources/js/components/daily-sales-comparison/utils.ts`
- **Purpose**: Transforms `ProcessedChartData` from the API into `SalesDayData[]` format

#### 3. Loading State

- **Component**: `SalesComparisonSkeleton`
- **Location**: `/resources/js/components/daily-sales-comparison/components/sales-comparison-skeleton.tsx`
- **Purpose**: Displays skeleton loader during API fetch

#### 4. Error State

- **Component**: `SalesComparisonError`
- **Location**: `/resources/js/components/daily-sales-comparison/components/sales-comparison-error.tsx`
- **Purpose**: Displays error message with retry functionality

## API Response Structure

### Raw API Response

```json
{
  "2025-09-13": { "07:00": 497, "08:00": 10734.7, ... },
  "2025-09-12": { "07:00": 1234, "08:00": 5678, ... },
  "2025-09-11": { "07:00": 2345, "08:00": 6789, ... },
  "2025-09-10": { "07:00": 3456, "08:00": 7890, ... }
}
```

### Processed Chart Data

```typescript
ProcessedChartData = {
    days: [
        { label: 'Sep 13', date: '2025-09-13', total: 250533.98 },
        { label: 'Sep 12', date: '2025-09-12', total: 7068720.45 },
        { label: 'Sep 11', date: '2025-09-11', total: 8166555.62 },
        { label: 'Sep 10', date: '2025-09-10', total: 8064541.02 },
    ],
    isEmpty: false,
    hasError: false,
};
```

### Sales Day Data (Component Format)

```typescript
SalesDayData[] = [
  { date: Date("2025-09-13"), amount: 250533.98, isToday: true },
  { date: Date("2025-09-12"), amount: 7068720.45, isToday: false },
  { date: Date("2025-09-11"), amount: 8166555.62, isToday: false },
  { date: Date("2025-09-10"), amount: 8064541.02, isToday: false }
]
```

## Usage

### Basic Usage

```tsx
<DailySalesComparison selectedDateRange={dateRange} />
```

### With Mock Data (Development)

```tsx
<DailySalesComparison selectedDateRange={dateRange} useMockData={true} />
```

### With Custom Data

```tsx
<DailySalesComparison selectedDateRange={dateRange} salesData={customSalesData} />
```

## Data Priority

The component uses the following priority for data sources:

1. **Provided salesData prop** - If custom data is provided via props
2. **API data** - If available and valid from useHoursChart hook
3. **Mock data** - If explicitly requested or as fallback
4. **Empty array** - While loading

## Performance Optimizations

### 1. Single API Call

Both `daily-chart-comparison` and `daily-sales-comparison` share the same API call through the `useHoursChart` hook, which includes:

- Request caching (5-minute TTL)
- Duplicate request prevention
- Optimized re-fetch logic

### 2. Memoization

- Hook options are memoized to prevent unnecessary re-renders
- Display data is computed with `useMemo`
- API date string is memoized

### 3. Conditional Rendering

- Component only renders when exactly one day is selected
- Loading and error states prevent unnecessary processing

## Testing

### Unit Tests

Test file: `/resources/js/components/daily-sales-comparison/__tests__/integration.test.tsx`

Key test cases:

- Data converter function correctness
- Empty/error data handling
- Today identification logic
- API call sharing verification

### Manual Testing

1. Select a single day in the calendar
2. Observe network tab - should see only ONE `get-hours-chart` API call
3. Both components should display data from the same API response
4. Test error states by disconnecting network
5. Test loading states on slow connections

## Troubleshooting

### Issue: Duplicate API Calls

**Solution**: Ensure both components are using the same date format through `formatDateForApi`

### Issue: Data Not Displaying

**Solutions**:

1. Check if exactly one day is selected
2. Verify API endpoint is accessible
3. Check browser console for validation errors

### Issue: Loading State Persists

**Solutions**:

1. Check network tab for failed requests
2. Verify API response format matches expected structure
3. Check for JavaScript errors in console

## Future Enhancements

1. **Real-time Updates**: Add WebSocket support for live sales data
2. **Data Aggregation**: Support for hourly breakdown within daily view
3. **Export Functionality**: Add ability to export daily comparison data
4. **Customizable Periods**: Allow configuration of comparison periods (e.g., 7 days instead of 4)
5. **Performance Metrics**: Add timing metrics for API calls and rendering
