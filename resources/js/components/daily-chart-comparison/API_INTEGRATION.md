# Daily Chart Comparison - API Integration Documentation

## Overview

The daily-chart-comparison component has been fully integrated with the CostenoSales API to fetch real-time hourly sales data and display it as daily totals.

## API Configuration

### Endpoint Details
- **URL**: `http://192.168.100.20/api/get_hours_chart`
- **Method**: `POST`
- **Authentication**: Bearer token (hardcoded)
- **Token**: `342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f`
- **Cache TTL**: 20 minutes

### Request Format
```json
{
  "date": "2025-09-13"
}
```

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-09-13",
      "hours": [
        { "hour": "00:00", "value": 50000 },
        { "hour": "01:00", "value": 30000 },
        // ... 24 hours of data
      ]
    },
    // ... 3 more days (4 days total)
  ]
}
```

## Implementation Architecture

### Service Layer (`/lib/services/`)

1. **`api/endpoints.ts`** - API endpoint constants
2. **`api/types.ts`** - Base API types and interfaces
3. **`api/client.ts`** - Axios configuration with authentication
4. **`services/types.ts`** - Service-specific data types
5. **`services/cache.ts`** - In-memory cache with 20-minute TTL
6. **`services/hours-chart.service.ts`** - Main service that:
   - Fetches data from API
   - Sums hourly values to daily totals
   - Caches processed data
   - Handles retries with exponential backoff

### React Integration (`/hooks/`)

**`use-hours-chart.ts`** - Custom React hook that:
- Manages loading, error, and data states
- Implements 300ms debouncing for date changes
- Cancels previous requests when date changes
- Provides retry functionality
- Supports cache clearing

### Component Integration

**`daily-chart-comparison.tsx`** - Main component that:
- Uses `useHoursChart` hook to fetch data
- Shows loading skeleton while fetching
- Displays error state with retry option
- Falls back to mock data if needed
- Converts API data to chart format

## Data Processing Flow

1. **Date Selection**: User selects a date via MainFilterCalendar
2. **API Request**: Component sends POST request with selected date
3. **Data Reception**: API returns 4 days of hourly data
4. **Processing**: Service sums hourly values for each day
5. **Caching**: Processed data cached for 20 minutes
6. **Display**: Chart shows daily totals with Spanish labels

## Spanish Labels Mapping

- Day 1 (selected): "Hoy"
- Day 2: "Ayer"
- Day 3: "Hace 2 días"
- Day 4: "Hace 3 días"

## Features

### Performance Optimizations
- **Caching**: 20-minute cache reduces API calls
- **Debouncing**: 300ms delay prevents excessive requests
- **Request Cancellation**: Aborts outdated requests
- **Memoization**: React.memo prevents unnecessary re-renders

### Error Handling
- **Retry Logic**: Automatic retry with exponential backoff
- **Manual Retry**: User can click retry button
- **Error Display**: Clear error messages in Spanish
- **Fallback**: Can use mock data if API fails

### Loading States
- **Skeleton Loader**: Animated placeholder during fetch
- **Minimum Duration**: Prevents UI flashing
- **Progressive Enhancement**: Shows cached data while refreshing

## Usage Examples

### Basic Usage (API Data)
```tsx
<DailyChartComparison
  selectedDateRange={dateRange}
/>
```

### With Mock Data (Development)
```tsx
<DailyChartComparison
  selectedDateRange={dateRange}
  useMockData={true}
/>
```

### With Custom Data Override
```tsx
<DailyChartComparison
  selectedDateRange={dateRange}
  chartData={customData}
/>
```

## Testing

To test the integration:

1. **Verify API Connection**:
   ```bash
   curl -X POST http://192.168.100.20/api/get_hours_chart \
     -H "Authorization: Bearer 342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f" \
     -H "Content-Type: application/json" \
     -d '{"date": "2025-09-13"}'
   ```

2. **Check Browser Console**:
   - Enable development mode to see detailed logs
   - Monitor cache hits/misses
   - Verify data processing

3. **Test Error States**:
   - Disconnect network to test error handling
   - Verify retry functionality works
   - Check fallback to mock data

## Troubleshooting

### Common Issues

1. **No Data Displayed**:
   - Check date format (must be YYYY-MM-DD)
   - Verify API is accessible
   - Check browser console for errors

2. **Authentication Errors**:
   - Token may have expired
   - Check token in `api/client.ts`

3. **Cache Issues**:
   - Use `clearCache()` from hook
   - Wait 20 minutes for cache expiry
   - Check browser console for cache logs

4. **Performance Issues**:
   - Verify debouncing is working
   - Check for duplicate API calls
   - Monitor component re-renders

## Future Enhancements

1. **Configuration**:
   - Move token to environment variable
   - Make cache TTL configurable
   - Add API timeout configuration

2. **Features**:
   - Add data export functionality
   - Implement real-time updates
   - Add comparison period customization

3. **Performance**:
   - Implement IndexedDB for persistent cache
   - Add service worker for offline support
   - Optimize bundle size with code splitting