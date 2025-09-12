import * as React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDateRange } from './hooks/use-date-range';
import { PeriodSelector } from './components/period-selector';
import { CalendarView } from './components/calendar-view';
import { RefreshButton } from './components/refresh-button';
import { formatDateRange, getDateRange } from './utils';
import type { MainFilterCalendarProps, DateRange } from './types';

/**
 * MainFilterCalendar - A comprehensive date range selection component with Spanish localization.
 * 
 * Combines a dropdown for quick period selection with an interactive calendar for custom dates.
 * Features automatic initialization to today's date and includes a refresh button for data updates.
 * 
 * @component
 * @param {MainFilterCalendarProps} props - Component configuration props
 * @returns {JSX.Element} Complete date filter interface with popover calendar
 * 
 * @description Key features:
 * - Quick period selection (today, yesterday, this week, etc.)
 * - Interactive calendar with date range selection
 * - Spanish localization for all text and date formats
 * - Automatic initialization to today's date
 * - Apply/Cancel actions for confirming selections
 * - Integrated refresh button for triggering data updates
 * 
 * @example
 * ```tsx
 * // Basic usage with controlled state
 * <MainFilterCalendar 
 *   value={selectedDateRange}
 *   onChange={handleDateRangeChange}
 *   placeholder="Seleccionar período"
 *   onRefresh={() => refetchData()}
 * />
 * 
 * // Uncontrolled usage (automatically initializes to today)
 * <MainFilterCalendar onRefresh={() => window.location.reload()} />
 * ```
 */
export function MainFilterCalendar({
  value,
  onChange,
  placeholder = "Seleccionar fechas",
  onRefresh
}: MainFilterCalendarProps) {
  // Validate props for development warnings
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (value && (!value.from || (value.from && !(value.from instanceof Date)))) {
        console.warn('MainFilterCalendar: Invalid DateRange.from provided:', value.from);
      }
      if (value && value.to && !(value.to instanceof Date)) {
        console.warn('MainFilterCalendar: Invalid DateRange.to provided:', value.to);
      }
      if (placeholder && typeof placeholder !== 'string') {
        console.warn('MainFilterCalendar: placeholder should be a string:', placeholder);
      }
    }
  }, [value, placeholder]);
  
  // Popover open/close state
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Memoize today's date range to avoid recalculation on every render
  const defaultRange = React.useMemo(() => {
    try {
      return getDateRange('today');
    } catch (error) {
      console.error('MainFilterCalendar: Error getting default range:', error);
      return { from: new Date(), to: new Date() };
    }
  }, []);
  
  // Custom hook for managing all date range state and interactions
  const {
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
  } = useDateRange({ value });

  // Initialize component with today's date on mount if no external value provided
  React.useEffect(() => {
    if (!value) {
      try {
        const todayRange = getDateRange('today');
        setTempRange(todayRange);
        onChange?.(todayRange);
      } catch (error) {
        console.error('MainFilterCalendar: Error initializing with today\'s date:', error);
        // Provide fallback initialization
        const fallbackRange = { from: new Date(), to: new Date() };
        setTempRange(fallbackRange);
        onChange?.(fallbackRange);
      }
    }
  }, []); // Intentionally empty deps - run only once on mount

  // Synchronize internal state when popover opens
  React.useEffect(() => {
    if (isOpen) {
      const rangeToUse = value || defaultRange;
      setTempRange(rangeToUse);
      
      // Detect if current range matches "today" pattern for period selector
      const isTodayRange = !value || (
        rangeToUse?.from && rangeToUse?.to && 
        rangeToUse.from.getTime() === rangeToUse.to.getTime() && 
        rangeToUse.from.toDateString() === new Date().toDateString()
      );
      
      if (isTodayRange) {
        setSelectedPeriod('today');
      }
      
      // Navigate calendar to show current selection or fallback to today
      const dateToShow = rangeToUse?.from || new Date();
      setCurrentMonth(dateToShow.getMonth());
      setCurrentYear(dateToShow.getFullYear());
    }
  }, [isOpen, value, defaultRange, setTempRange, setSelectedPeriod, setCurrentMonth, setCurrentYear]);

  // Display value logic: use provided value or default to today's range
  const currentValue = value || defaultRange;

  // Format the display text for the button, falling back to placeholder
  const displayText = formatDateRange(currentValue) || placeholder;

  /**
   * Applies the currently selected temporary range and closes the popover.
   * Calls the onChange callback with the selected date range.
   * Includes error handling for callback execution.
   */
  const handleApply = React.useCallback(() => {
    try {
      onChange?.(tempRange);
      setIsOpen(false);
    } catch (error) {
      console.error('MainFilterCalendar: Error in onChange callback:', error);
      // Still close the popover even if callback fails
      setIsOpen(false);
    }
  }, [onChange, tempRange]);

  /**
   * Cancels the current selection and reverts to the original value.
   * Resets temporary range to the external value or default range.
   */
  const handleCancel = React.useCallback(() => {
    const rangeToUse = value || defaultRange;
    setTempRange(rangeToUse);
    setIsOpen(false);
  }, [value, defaultRange, setTempRange]);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-medium h-9 px-3 py-1",
                "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400", 
                "transition-colors shadow-sm",
                !currentValue && "text-muted-foreground"
              )}
              aria-label={`Filtro de fechas: ${displayText}`}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
            >
              <Calendar className="mr-3 h-4 w-4 text-gray-600" aria-hidden="true" />
              <span className="flex-1 text-gray-700">{displayText}</span>
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-0" 
            align="start" 
            sideOffset={4}
            role="dialog"
            aria-label="Selector de rango de fechas"
          >
            <div className="bg-white rounded-lg shadow-xl border border-gray-200">
              {/* Period Selector Section */}
              <PeriodSelector 
                selectedPeriod={selectedPeriod} 
                onPeriodChange={handlePeriodChange} 
              />

              {/* Calendar Section */}
              <CalendarView
                currentMonth={currentMonth}
                currentYear={currentYear}
                tempRange={tempRange}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
                onDayClick={handleDayClick}
              />

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-6 py-2 h-9 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"
                  aria-label="Cancelar selección de fechas"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleApply}
                  className="px-6 py-2 h-9 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                  aria-label="Aplicar selección de fechas"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Refresh Button - triggers data refresh or page reload */}
      <RefreshButton onRefresh={onRefresh || (() => window.location.reload())} />
    </div>
  );
}