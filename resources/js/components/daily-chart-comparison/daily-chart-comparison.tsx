import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DailyChartHeader } from './components/daily-chart-header';
import { DailyComparisonChart } from './components/daily-comparison-chart';
import { DailyChartSkeleton } from './components/daily-chart-skeleton';
import { DailyChartError } from './components/daily-chart-error';
import type { DailyChartComparisonProps, DailyChartData } from './types';
import {
  isSingleDaySelected,
  generateMockDailyChartData,
  validateDailyChartData,
  validateChartDateRange,
  convertApiDataToChartData
} from './utils';
import { useHoursChart } from '@/hooks/use-hours-chart';
import { formatDateForApi } from '@/lib/services/hours-chart.service';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedDailyChartHeader = React.memo(DailyChartHeader);

// Performance: Memoized chart component with deep comparison for chart data
const MemoizedDailyComparisonChart = React.memo(DailyComparisonChart, (prevProps, nextProps) => {
  // Custom comparison for better performance - only re-render if actual data changes
  const prevData = prevProps.data;
  const nextData = nextProps.data;
  
  // Compare chart configuration props
  if (
    prevProps.height !== nextProps.height ||
    prevProps.showGrid !== nextProps.showGrid ||
    prevProps.orientation !== nextProps.orientation
  ) {
    return false; // Props changed, need to re-render
  }
  
  // Deep comparison of chart data
  if (prevData === nextData) return true; // Same reference, no change
  if (!prevData || !nextData) return false; // One is null/undefined
  
  // Compare selectedDay data
  if (
    prevData.selectedDay.date.getTime() !== nextData.selectedDay.date.getTime() ||
    prevData.selectedDay.fullDayName !== nextData.selectedDay.fullDayName ||
    prevData.selectedDay.amount !== nextData.selectedDay.amount
  ) {
    return false; // Selected day data changed
  }
  
  // Compare comparison data arrays
  if (prevData.comparisonData.length !== nextData.comparisonData.length) return false;
  
  for (let i = 0; i < prevData.comparisonData.length; i++) {
    const prevPoint = prevData.comparisonData[i];
    const nextPoint = nextData.comparisonData[i];
    
    if (
      prevPoint.period !== nextPoint.period ||
      prevPoint.amount !== nextPoint.amount ||
      prevPoint.color !== nextPoint.color ||
      prevPoint.date.getTime() !== nextPoint.date.getTime() ||
      prevPoint.isSelected !== nextPoint.isSelected
    ) {
      return false; // Comparison data changed
    }
  }
  
  return true; // No changes detected
});

/**
 * DailyChartComparison - Main component for displaying daily sales chart comparison.
 * 
 * Shows a bar chart comparing sales data for the selected day against:
 * - Yesterday (same day - 1 day)
 * - Last week (same day - 7 days)  
 * - Last month (same day - 30 days)
 * 
 * Only renders when exactly one day is selected in the date filter.
 * Uses mock data for development but can accept real chart data via props.
 * 
 * @component
 * @param {DailyChartComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Daily chart comparison interface or null if conditions not met
 * 
 * @description Key features:
 * - Conditional rendering based on single day selection
 * - Interactive bar chart with 4-period daily comparison
 * - Responsive design that adapts to different screen sizes
 * - Accessibility-compliant structure with ARIA labels and proper semantics
 * - Support for both mock and real daily chart data
 * - Runtime validation with development logging for data integrity
 * - Mexican peso currency formatting with abbreviated chart values
 * - Spanish localization for period labels and interface text
 * - Theme-consistent styling using design system variables
 * - Performance optimizations with memoized components
 * - Primary color highlighting for the selected day
 * 
 * @example
 * ```tsx
 * // Basic usage with mock data
 * <DailyChartComparison 
 *   selectedDateRange={singleDayRange}
 * />
 * 
 * // With custom chart data
 * <DailyChartComparison 
 *   selectedDateRange={singleDayRange}
 *   chartData={realDailyChartData}
 * />
 * ```
 */
export function DailyChartComparison({
  selectedDateRange,
  chartData,
  useMockData = false // Allow override for testing
}: DailyChartComparisonProps) {
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('DailyChartComparison debug:', {
      selectedDateRange,
      hasFrom: !!selectedDateRange?.from,
      hasTo: !!selectedDateRange?.to,
      fromDate: selectedDateRange?.from?.toString(),
      toDate: selectedDateRange?.to?.toString()
    });
  }

  // Simplified validation - check if we have a single day selected
  const isValidSingleDay = React.useMemo(() => {
    const result = isSingleDaySelected(selectedDateRange);
    if (process.env.NODE_ENV === 'development') {
      console.log('isSingleDaySelected result:', result);
    }
    return result;
  }, [selectedDateRange]);

  // Get the selected date - use stable today as fallback to prevent re-renders
  const selectedDate = React.useMemo(() => {
    return selectedDateRange?.from || new Date();
  }, [selectedDateRange?.from]);

  // Format date for API
  const apiDateString = React.useMemo(() => {
    if (!selectedDate) return null;
    return formatDateForApi(selectedDate);
  }, [selectedDate]);

  // Memoize hook options to prevent re-renders
  const hookOptions = React.useMemo(() => ({
    enableRetry: true,
    maxRetries: 3,
    debounceMs: 300,
    onError: (errorMessage: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Daily chart API error:', errorMessage);
      }
    }
  }), []);

  // Fetch real data from API using the custom hook
  const {
    data: apiData,
    isLoading,
    error,
    refetch
  } = useHoursChart(apiDateString, hookOptions);

  // Debug component lifecycle
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: Component mounted/updated');
      return () => {
        console.log('DailyChartComparison: Component unmounting');
      };
    }
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: selectedDateRange changed', selectedDateRange);
    }
  }, [selectedDateRange]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: selectedDate changed', selectedDate);
    }
  }, [selectedDate]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: apiDateString changed', apiDateString);
    }
  }, [apiDateString]);

  // Convert API data to chart format or use mock/provided data
  const displayData = React.useMemo((): DailyChartData | null => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: Computing displayData', {
        hasChartData: !!chartData,
        useMockData,
        hasApiData: !!apiData,
        isLoading,
        apiDataHasError: apiData?.hasError,
        selectedDate
      });
    }

    // If explicit chart data is provided, use it
    if (chartData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('DailyChartComparison: Using provided chartData');
      }
      return chartData;
    }

    // If using mock data or API failed, generate mock data
    if (useMockData || (!apiData && !isLoading)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('DailyChartComparison: Using mock data');
      }
      return generateMockDailyChartData(selectedDate);
    }

    // Convert API data to chart format
    if (apiData && !apiData.hasError) {
      if (process.env.NODE_ENV === 'development') {
        console.log('DailyChartComparison: Converting API data', apiData);
      }
      const converted = convertApiDataToChartData(apiData, selectedDate);
      if (converted) {
        // Validate the converted data in development
        if (process.env.NODE_ENV === 'development') {
          const validation = validateDailyChartData(converted);
          if (!validation.isValid) {
            console.error('Daily chart data validation failed:', validation.errors);
          }
          if (validation.warnings.length > 0) {
            console.warn('Daily chart data warnings:', validation.warnings);
          }
          console.log('DailyChartComparison: Converted API data successfully', converted);
        }
        return converted;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('DailyChartComparison: API data conversion failed');
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: No displayData available, returning null');
    }
    return null;
  }, [chartData, useMockData, apiData, isLoading, selectedDate]);

  // Only show for single day selections
  if (!isValidSingleDay) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: Not showing - single day validation failed');
    }
    return null;
  }

  // Show loading skeleton while fetching data
  if (isLoading && !displayData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: Showing loading skeleton');
    }
    return <DailyChartSkeleton height={210} />;
  }

  // Show error state if API failed and no fallback data
  if (error && !displayData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: Showing error state', error);
    }
    return (
      <DailyChartError
        message={error}
        onRetry={refetch}
        height={210}
      />
    );
  }

  // Show nothing if no data available
  if (!displayData) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DailyChartComparison: No display data available');
    }
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('DailyChartComparison: About to render chart component', {
      displayData: displayData ? 'present' : 'null',
      isLoading,
      error,
      hasChart: !!displayData
    });
  }

  return (
    <Card className="w-full border-border">
      <CardContent className="px-4 py-3">
        {/* Header section - memoized for performance */}
        <MemoizedDailyChartHeader />
        
        {/* Chart container - optimized rendering with proper accessibility */}
        <div 
          className="mt-4 focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_svg]:outline-none [&_*]:focus:outline-none [&_*]:outline-none"
          role="region"
          aria-label="Gráfico de comparación diaria de ventas"
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          <MemoizedDailyComparisonChart
            data={displayData}
            height={210}
            showGrid={true}
            orientation="vertical"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default DailyChartComparison;