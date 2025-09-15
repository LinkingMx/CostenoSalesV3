import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklyComparisonHeader } from './components/weekly-comparison-header';
import type { WeeklySalesComparisonProps, WeeklySummaryData } from './types';
import { isCompleteWeekSelected } from '@/components/weekly-chart-comparison/utils';
import {
  fetchWeeklyChartWithRetry,
  formatDateForApi,
  isValidWeeklyChartDateRange
} from '@/lib/services/weekly-chart.service';
import {
  transformApiDataToWeeklySummary,
  formatWeeklySalesAmount
} from './utils';

// Performance: Pre-memoized header component to prevent unnecessary re-renders
const MemoizedWeeklyComparisonHeader = React.memo(WeeklyComparisonHeader);

/**
 * WeeklySalesComparison - Main component for displaying weekly sales comparison.
 *
 * Shows 3 cards representing sales totals for the selected complete week (Monday through Sunday).
 * Only renders when exactly one complete week is selected in the date filter.
 * Uses real API data from WeeklyChartProvider context.
 *
 * @component
 * @param {WeeklySalesComparisonProps} props - Component configuration props
 * @returns {JSX.Element | null} Weekly sales comparison interface or null if conditions not met
 *
 * @description Key features:
 * - Displays 3 weekly summary cards (actual, last, two_last weeks)
 * - Each card shows date range and total sales amount for the week
 * - Uses shared API data from WeeklyChartProvider context
 * - Conditional rendering based on complete week selection (Monday to Sunday)
 * - Mexican peso currency formatting
 * - Responsive card layout matching the weekly design pattern
 * - Accessibility-compliant structure with ARIA labels
 *
 * @example
 * ```tsx
 * <WeeklyChartProvider selectedDateRange={selectedDateRange}>
 *   <WeeklySalesComparison selectedDateRange={selectedDateRange} />
 * </WeeklyChartProvider>
 * ```
 */
export function WeeklySalesComparison({
  selectedDateRange
}: WeeklySalesComparisonProps) {
  const [rawApiData, setRawApiData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Performance: Memoize complete week validation to avoid repeated calculations
  const isValidCompleteWeek = React.useMemo(() => {
    return isCompleteWeekSelected(selectedDateRange);
  }, [selectedDateRange]);

  // Fetch raw API data directly
  React.useEffect(() => {
    if (!isValidCompleteWeek || !selectedDateRange?.from || !selectedDateRange?.to) {
      setRawApiData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const startDate = formatDateForApi(selectedDateRange.from);
        const endDate = formatDateForApi(selectedDateRange.to);

        if (!isValidWeeklyChartDateRange(startDate, endDate)) {
          console.log('Invalid date range for API');
          return;
        }

        console.log('Fetching raw API data for weekly summary:', { startDate, endDate });

        // Fetch raw API data using the updated service
        const result = await fetchWeeklyChartWithRetry(startDate, endDate, 2);

        if (result.error) {
          console.error('API error:', result.error);
          setError(result.error);
          return;
        }

        // Use the raw API response data structure
        console.log('Raw API response received:', result.rawData);
        setRawApiData(result.rawData);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isValidCompleteWeek, selectedDateRange]);


  // Transform raw API data to weekly summary format
  const weeklySummaryData = React.useMemo((): WeeklySummaryData[] => {
    if (!rawApiData) {
      return [];
    }
    return transformApiDataToWeeklySummary(rawApiData);
  }, [rawApiData]);


  // Early return for performance - avoid unnecessary computations if not valid complete week
  if (!isValidCompleteWeek) {
    return null;
  }

  // Show nothing only if there's an error or no data after loading completes
  if (error) {
    return null;
  }

  // If still loading but no data, show loading state
  if (isLoading && weeklySummaryData.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="px-4 py-3">
          <MemoizedWeeklyComparisonHeader />
          <div className="space-y-2" role="region" aria-label="Cargando comparación de ventas semanales">
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando datos semanales...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If not loading but still no data, don't show the component
  if (!isLoading && weeklySummaryData.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-3">
        {/* Header section - memoized for performance */}
        <MemoizedWeeklyComparisonHeader />

        {/* Weekly summary cards container - optimized rendering */}
        <div
          className="space-y-2"
          role="region"
          aria-label="Comparación de ventas semanales por totales"
        >
          {weeklySummaryData.map((weekSummary) => (
            <WeeklySummaryCard
              key={weekSummary.weekLabel}
              data={weekSummary}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * WeeklySummaryCard - Individual card component for displaying weekly summary data.
 * Renders a card with week indicator, date range, and total sales amount.
 */
function WeeklySummaryCard({ data }: { data: WeeklySummaryData }) {
  // Get week letter for circular indicator
  const weekLetter = getWeekLetter(data.weekLabel);
  const formattedAmount = formatWeeklySalesAmount(data.totalAmount);

  return (
    <div
      className="flex items-center justify-between px-3 py-3 rounded-lg bg-card border border-border hover:bg-muted transition-all duration-200"
      role="article"
      aria-label={`Ventas de la semana ${data.dateRangeLabel}: ${formattedAmount}`}
    >
      {/* Left side - Week indicator and date range information */}
      <div className="flex items-center gap-2.5">
        {/* Circular week indicator */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground shadow-sm bg-primary"
          aria-hidden="true"
        >
          {weekLetter}
        </div>

        {/* Formatted date range display */}
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight text-foreground">
            {data.dateRangeLabel}
          </span>
        </div>
      </div>

      {/* Right side - Total sales amount information */}
      <div className="text-right">
        <div className="text-lg font-bold tabular-nums text-foreground">
          {formattedAmount}
        </div>
      </div>
    </div>
  );
}

/**
 * Gets the Spanish letter indicator for a week label.
 */
function getWeekLetter(weekLabel: string): string {
  switch (weekLabel) {
    case 'actual':
      return 'A'; // Actual
    case 'last':
      return 'P'; // Pasada
    case 'two_last':
      return 'H'; // Hace 2 semanas
    default:
      return 'S'; // Semana (fallback)
  }
}

export default WeeklySalesComparison;