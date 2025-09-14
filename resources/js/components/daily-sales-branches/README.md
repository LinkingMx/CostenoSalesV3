# Daily Sales Branches Component

## Overview

The Daily Sales Branches component is a comprehensive, production-ready React component for displaying branch sales analytics with real-time API integration, week-over-week comparison, and Spanish localization.

## Architecture

```
daily-sales-branches/
├── README.md                           # This documentation file
├── index.ts                            # Component exports and public API
├── daily-sales-branches.tsx            # Main container component
├── types.ts                            # TypeScript interfaces and types
├── utils.ts                            # Utility functions and constants
├── components/
│   └── branch-collapsible-item.tsx     # Individual branch collapsible
└── hooks/
    └── use-branch-sales-data.ts        # API integration and state management
```

## Key Features

### 🔌 API Integration
- **Real-time Data**: Connects to `main_dashboard_data` endpoint
- **Week-over-Week Comparison**: Automatic percentage calculation
- **Dual API Calls**: Current period + previous week for comparison
- **Smart Caching**: 20-minute TTL with intelligent cache management
- **Rate Limiting**: 10 requests per minute with automatic throttling

### 📊 Data Processing
- **Automatic Calculations**: Total sales from open + closed accounts
- **Percentage Logic**: Week-over-week growth with 100% fallback
- **Data Validation**: Comprehensive input validation and error handling
- **Sorting**: Branches sorted by total sales (highest first)

### 🎨 User Experience
- **Conditional Rendering**: Only shows for single-day selections
- **Loading States**: Skeleton placeholders with Spanish localization
- **Error Handling**: Graceful degradation with retry functionality
- **Spanish UI**: Complete Spanish localization for Mexican market

### ⚡ Performance
- **React Optimization**: Memoization and efficient re-render prevention
- **Request Deduplication**: Prevents duplicate API calls
- **Debouncing**: 300ms debounce to prevent rapid successive requests
- **Memory Management**: Proper cleanup and garbage collection

## Usage

### Basic Usage (Recommended)
```tsx
import { DailySalesBranches } from '@/components/daily-sales-branches';

// Automatic API integration with week-over-week comparison
<DailySalesBranches selectedDateRange={singleDayRange} />
```

### Static Data Usage (Testing)
```tsx
// Override API integration with static data
<DailySalesBranches
  selectedDateRange={singleDayRange}
  branches={testBranchData}
/>
```

### Advanced Hook Usage
```tsx
import { useBranchSalesData } from '@/components/daily-sales-branches';

const {
  branches,
  totalSales,
  isLoading,
  error,
  refresh
} = useBranchSalesData(dateRange, {
  enabled: true,
  fallbackData: mockData,
  useFallbackDuringLoad: true
});
```

## API Integration

### Endpoint Configuration
- **URL**: `http://192.168.100.20/api/main_dashboard_data`
- **Method**: POST
- **Headers**: `Accept: application/json`, `Content-Type: application/json`
- **Authentication**: Bearer token (configured in service layer)

### Request Format
```json
{
  "start_date": "2025-09-14",
  "end_date": "2025-09-14"
}
```

### Response Processing
The component automatically processes API responses:
1. **Current Period**: Fetches selected day data
2. **Previous Week**: Fetches same day from previous week
3. **Comparison**: Calculates percentage: `((current - previous) / previous) * 100`
4. **Mapping**: Converts API format to component interface

## Component Behavior

### Conditional Rendering
- ✅ **Shows**: When exactly one day is selected
- ❌ **Hidden**: When date range spans multiple days
- ❌ **Hidden**: When no date is selected

### Data States
1. **Loading**: Shows skeleton placeholders with Spanish text
2. **Success**: Displays real branch data with percentages
3. **Error**: Shows retry button with cached data if available
4. **Empty**: Shows "no data available" message

### Branch Display
- **Sorting**: By total sales (highest to lowest)
- **Cards**: Open accounts, closed tickets, average ticket
- **Growth**: Week-over-week percentage with up/down indicators
- **Truncation**: Branch names limited to 20 characters with ellipsis

## Performance Optimizations

### React Optimizations
- **Memoization**: `useMemo` for expensive calculations
- **Callback Stability**: `useCallback` for function props
- **Re-render Prevention**: Optimized dependency arrays

### API Optimizations
- **Request Deduplication**: Same requests share promises
- **Intelligent Caching**: 20-minute TTL with cache invalidation
- **Rate Limiting**: 10 requests/minute with Spanish error messages
- **Request Cancellation**: Automatic cleanup on component unmount

### Memory Management
- **AbortController**: Proper request cancellation
- **Timeout Cleanup**: Prevents memory leaks from pending timeouts
- **Mount State Tracking**: Prevents state updates after unmount

## Error Handling

### Error States
1. **Network Errors**: Shows retry button with fallback data
2. **Rate Limiting**: Spanish message: "Demasiadas solicitudes..."
3. **Invalid Data**: Graceful degradation with validation logging
4. **API Errors**: User-friendly Spanish error messages

### Fallback Strategy
1. **Primary**: Real API data with week-over-week comparison
2. **Secondary**: Cached data from previous successful requests
3. **Tertiary**: Fallback data (dummy data or empty state)

## Development

### Environment Variables
- `NODE_ENV=development`: Enables debug logging and warnings
- Development logs include cache hits, API calls, and data validation

### Testing Data
Mock data is available in `utils.ts` as `DUMMY_BRANCHES_DATA` with realistic:
- Branch names and locations
- Sales figures and growth percentages
- Complete and incomplete data scenarios
- Various edge cases for testing

### Debug Information
In development mode, the component logs:
- 📦 Cache hits and misses
- 🚀 API request details
- ⚠️ Data validation warnings
- 🔄 State transitions

## Security Considerations

### Current Implementation
- **Bearer Token**: Currently hardcoded (production requires environment variables)
- **Input Validation**: All user inputs validated before API calls
- **Rate Limiting**: Prevents API abuse and server overload
- **Data Sanitization**: API responses validated and sanitized

### Production Recommendations
- Move authentication token to secure environment variables
- Implement proper CORS configuration
- Add API request signing for enhanced security
- Consider implementing user-based rate limiting

## Troubleshooting

### Common Issues

**Component not showing:**
- Check if `selectedDateRange` is a single day
- Verify API endpoint is accessible
- Check network connectivity

**Infinite API calls:**
- Fixed in v1.2.0 with proper dependency management
- Rate limiting prevents excessive requests

**Performance issues:**
- Component includes comprehensive optimizations
- Check React DevTools for unnecessary re-renders

**Error states:**
- Component gracefully handles all error scenarios
- Check browser console for detailed error information

## Version History

- **v1.2.0** (2025-09-14): Complete API integration with optimizations
- **v1.1.0**: Added week-over-week comparison functionality
- **v1.0.0**: Initial implementation with static data support

## Contributing

When modifying this component:
1. Maintain TypeScript strict mode compliance
2. Follow Spanish localization patterns
3. Update tests for new functionality
4. Preserve performance optimizations
5. Document breaking changes

## Related Components

- `MainFilterCalendar`: Provides date range selection
- `WeeklyChartComparison`: Complementary chart visualization
- `SalesDayCard`: Similar design patterns and styling