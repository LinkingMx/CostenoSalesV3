import * as React from 'react';
import type { DateRange, UseDateRangeReturn, PeriodKey } from '../types';
import { getDateRange } from '../utils';

/**
 * Options for configuring the useDateRange hook behavior.
 *
 * @interface UseDateRangeOptions
 * @property {DateRange} [value] - External date range value for controlled usage
 * @property {PeriodKey} [defaultPeriod='today'] - Default period to initialize with
 * @property {function} [onAutoApply] - Callback for automatic period application
 */
interface UseDateRangeOptions {
  value?: DateRange;
  defaultPeriod?: PeriodKey;
  onAutoApply?: (range: DateRange | undefined) => void;
}

/**
 * Custom React hook for managing date range selection state and interactions.
 * Provides all necessary state variables and handlers for calendar functionality.
 * 
 * @function useDateRange
 * @param {UseDateRangeOptions} options - Configuration options for the hook
 * @returns {UseDateRangeReturn} State variables and handler functions
 * 
 * @description This hook manages:
 * - Temporary date range during selection process
 * - Current period selection (today, thisWeek, custom, etc.)
 * - Calendar navigation state (current month/year displayed)
 * - Event handlers for period changes, day clicks, and navigation
 * 
 * @example
 * ```tsx
 * const {
 *   tempRange,
 *   selectedPeriod,
 *   handlePeriodChange,
 *   handleDayClick,
 *   currentMonth,
 *   currentYear
 * } = useDateRange({ 
 *   value: externalDateRange, 
 *   defaultPeriod: 'thisWeek' 
 * });
 * ```
 */
export function useDateRange({
  value,
  defaultPeriod = 'today',
  onAutoApply
}: UseDateRangeOptions = {}): UseDateRangeReturn {
  // Get current date once to avoid recalculation
  const today = React.useMemo(() => new Date(), []);
  
  // Calendar navigation state - initialize with current date
  const [currentMonth, setCurrentMonth] = React.useState(() => today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(() => today.getFullYear());
  
  // Period selection state - tracks which quick period is selected
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>(defaultPeriod);
  
  // Memoize default range calculation to avoid unnecessary recalculations
  const defaultRange = React.useMemo(() => getDateRange(defaultPeriod), [defaultPeriod]);
  
  // Temporary range during selection process - initialize with value or default
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(() => value || defaultRange);

  /**
   * Handles period selection changes from the dropdown.
   * Updates the selected period and calculates the corresponding date range.
   * For non-custom periods, also updates the calendar view and auto-applies if callback provided.
   *
   * @function handlePeriodChange
   * @param {string} period - The selected period key (today, thisWeek, custom, etc.)
   */
  const handlePeriodChange = React.useCallback((period: string) => {
    setSelectedPeriod(period);

    if (period !== 'custom') {
      // Calculate the date range for the selected period
      const dateRange = getDateRange(period as PeriodKey);
      setTempRange(dateRange);

      // Navigate calendar to show the selected date range
      if (dateRange.from) {
        setCurrentMonth(dateRange.from.getMonth());
        setCurrentYear(dateRange.from.getFullYear());
      }

      // Auto-apply for quick periods if callback provided
      if (onAutoApply) {
        try {
          onAutoApply(dateRange);
        } catch (error) {
          console.error('MainFilterCalendar: Error in onAutoApply callback:', error);
        }
      }
    }
    // For 'custom' period, keep existing tempRange and let user select manually
  }, [onAutoApply, setCurrentMonth, setCurrentYear]);

  /**
   * Handles day clicks on the calendar for manual date range selection.
   * Implements a two-click selection pattern: first click sets start date,
   * second click sets end date with automatic ordering.
   * 
   * @function handleDayClick
   * @param {number} day - Day of month that was clicked (1-31)
   * 
   * @description Selection logic:
   * 1. No existing range OR complete range exists → Start new range with clicked date
   * 2. Partial range (only 'from' date) → Set 'to' date, auto-ordering if necessary
   * 3. Always switches to 'custom' period when manually selecting dates
   */
  const handleDayClick = React.useCallback((day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    // Switch to custom period since user is manually selecting
    setSelectedPeriod('custom');
    
    // Case 1: Start new range selection
    if (!tempRange?.from || (tempRange.from && tempRange.to)) {
      setTempRange({ from: clickedDate, to: undefined });
      return;
    }
    
    // Case 2: Complete range selection with existing 'from' date
    if (tempRange.from && !tempRange.to) {
      const fromTime = tempRange.from.getTime();
      const clickedTime = clickedDate.getTime();
      
      // Ensure proper date ordering: from <= to
      if (clickedTime < fromTime) {
        setTempRange({ from: clickedDate, to: tempRange.from });
      } else {
        setTempRange({ from: tempRange.from, to: clickedDate });
      }
      return;
    }
  }, [currentMonth, currentYear, tempRange]);

  /**
   * Navigates to the previous month in the calendar view.
   * Handles year rollover when navigating from January to December.
   * 
   * @function handlePreviousMonth
   */
  const handlePreviousMonth = React.useCallback(() => {
    if (currentMonth === 0) {
      // January → December of previous year
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      // Any other month → previous month same year
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentMonth, currentYear]);

  /**
   * Navigates to the next month in the calendar view.
   * Handles year rollover when navigating from December to January.
   * 
   * @function handleNextMonth
   */
  const handleNextMonth = React.useCallback(() => {
    if (currentMonth === 11) {
      // December → January of next year
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      // Any other month → next month same year
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentMonth, currentYear]);

  return {
    tempRange,
    setTempRange,
    selectedPeriod,
    setSelectedPeriod,
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    handlePeriodChange,
    handleDayClick,
    handlePreviousMonth,
    handleNextMonth,
  };
}