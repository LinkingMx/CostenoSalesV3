/**
 * Test Integration Example for Daily Chart Comparison
 * 
 * This file demonstrates how to use the daily-chart-comparison component
 * with real API integration.
 */

import React from 'react';
import { DailyChartComparison } from './index';
import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Example 1: Basic usage with API data (default)
 */
export function ExampleWithAPI() {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  return (
    <DailyChartComparison
      selectedDateRange={selectedDateRange}
      // API data will be fetched automatically
    />
  );
}

/**
 * Example 2: Using mock data for development/testing
 */
export function ExampleWithMockData() {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  return (
    <DailyChartComparison
      selectedDateRange={selectedDateRange}
      useMockData={true} // Force mock data instead of API
    />
  );
}

/**
 * Example 3: Custom chart data override
 */
export function ExampleWithCustomData() {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  const customChartData = {
    selectedDay: {
      date: new Date(),
      fullDayName: 'Viernes, 13 de Septiembre',
      amount: 1500000
    },
    comparisonData: [
      {
        period: 'Hoy',
        amount: 1500000,
        color: '#897053',
        date: new Date(),
        isSelected: true
      },
      {
        period: 'Ayer',
        amount: 1400000,
        color: '#6b5d4a',
        date: new Date(Date.now() - 86400000),
        isSelected: false
      },
      {
        period: 'Hace 2 días',
        amount: 1300000,
        color: '#8b7355',
        date: new Date(Date.now() - 172800000),
        isSelected: false
      },
      {
        period: 'Hace 3 días',
        amount: 1200000,
        color: '#7a6649',
        date: new Date(Date.now() - 259200000),
        isSelected: false
      }
    ]
  };

  return (
    <DailyChartComparison
      selectedDateRange={selectedDateRange}
      chartData={customChartData} // Override with custom data
    />
  );
}

/**
 * Example 4: Full integration with MainFilterCalendar
 */
export function ExampleFullIntegration() {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>();

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="p-4 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Seleccionar Fecha</h3>
        {/* MainFilterCalendar would go here */}
        <p className="text-sm text-muted-foreground">
          Integrar con MainFilterCalendar para selección de fecha
        </p>
      </div>

      {/* Chart component */}
      <DailyChartComparison
        selectedDateRange={selectedDateRange}
        // Will automatically fetch API data based on selected date
      />
    </div>
  );
}

/**
 * API Integration Details:
 * 
 * The component will automatically:
 * 1. Take the selected date from selectedDateRange
 * 2. Format it as YYYY-MM-DD for the API
 * 3. Send POST request to http://192.168.100.20/api/get_hours_chart
 * 4. Include the hardcoded Bearer token in headers
 * 5. Process the hourly data into daily totals
 * 6. Display in the chart with Spanish labels
 * 7. Cache the data for 20 minutes
 * 8. Show loading skeleton while fetching
 * 9. Show error state with retry button on failure
 * 10. Debounce date changes by 300ms
 * 
 * The API response format expected:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "date": "2025-09-13",
 *       "hours": [
 *         { "hour": "00:00", "value": 50000 },
 *         { "hour": "01:00", "value": 30000 },
 *         // ... more hourly data
 *       ]
 *     },
 *     // ... 3 more days of data
 *   ]
 * }
 */