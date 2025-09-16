import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import * as React from 'react';
import { CalendarView } from './components/calendar-view';
import { PeriodSelector } from './components/period-selector';
import { RefreshButton } from './components/refresh-button';
import { useDateRange } from './hooks/use-date-range';
import type { DateRange, MainFilterCalendarProps } from './types';
import { formatDateRange, getDateRange } from './utils';

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
 * - Quick period selection (today, yesterday, this week, etc.) with auto-apply
 * - Interactive calendar with date range selection and manual confirmation
 * - Spanish localization for all text and date formats
 * - Automatic initialization to today's date
 * - Smart UX: Auto-apply for quick periods, manual Apply/Cancel for custom dates
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
export function MainFilterCalendar({ value, onChange, placeholder = 'Seleccionar fechas', onRefresh }: MainFilterCalendarProps) {
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

    // Validation state for range selection
    const [validationError, setValidationError] = React.useState<string | null>(null);

    // Memoize today's date range to avoid recalculation on every render
    const defaultRange = React.useMemo(() => {
        try {
            const today = new Date();
            // Always ensure complete range with same from/to dates
            return {
                from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                to: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            };
        } catch (error) {
            console.error('MainFilterCalendar: Error getting default range:', error);
            const today = new Date();
            return {
                from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                to: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            };
        }
    }, []);

    // Auto-apply handler for quick period selections
    const handleAutoApply = React.useCallback(
        (range: DateRange | undefined) => {
            try {
                onChange?.(range);
                setIsOpen(false);
            } catch (error) {
                console.error('MainFilterCalendar: Error in auto-apply callback:', error);
                setIsOpen(false);
            }
        },
        [onChange],
    );

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
    } = useDateRange({ value, onAutoApply: handleAutoApply });

    // Initialize component with today's date on mount if no external value provided
    React.useEffect(() => {
        if (!value) {
            try {
                const todayRange = getDateRange('today');

                // Ensure we always have both from and to dates set to the same day
                const today = new Date();
                const completeRange: DateRange = {
                    from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    to: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                };

                if (process.env.NODE_ENV === 'development') {
                    console.log('🗓️ MainFilterCalendar: Initializing with complete today range:', {
                        from: completeRange.from?.toISOString(),
                        to: completeRange.to?.toISOString(),
                        originalRange: {
                            from: todayRange.from?.toISOString(),
                            to: todayRange.to?.toISOString(),
                        },
                    });
                }

                setTempRange(completeRange);
                onChange?.(completeRange);
            } catch (error) {
                console.error("MainFilterCalendar: Error initializing with today's date:", error);
                // Provide fallback initialization
                const today = new Date();
                const fallbackRange: DateRange = {
                    from: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    to: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                };
                setTempRange(fallbackRange);
                onChange?.(fallbackRange);
            }
        }
    }, [value, onChange, setTempRange]);

    // Synchronize internal state when popover opens
    React.useEffect(() => {
        if (isOpen) {
            const rangeToUse = value || defaultRange;
            setTempRange(rangeToUse);
            setValidationError(null); // Clear validation errors when opening

            // Detect if current range matches "today" pattern for period selector
            const isTodayRange =
                !value ||
                (rangeToUse?.from &&
                    rangeToUse?.to &&
                    rangeToUse.from.getTime() === rangeToUse.to.getTime() &&
                    rangeToUse.from.toDateString() === new Date().toDateString());

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
     * Validates the range before applying and shows error messages if needed.
     * Calls the onChange callback with the selected date range.
     * Includes error handling for callback execution.
     */
    const handleApply = React.useCallback(() => {
        try {
            // Clear any previous validation errors
            setValidationError(null);

            // Validate that we have a complete range
            if (!tempRange?.from || !tempRange?.to) {
                setValidationError('Por favor selecciona un rango de fechas');
                return;
            }

            // For single-day selections, ensure it was intentional (both dates are the same)
            // This is automatically handled by our day click logic, but we add this message
            // to guide users who might be confused
            if (tempRange.from.getTime() === tempRange.to.getTime()) {
                // Allow single-day selections but provide guidance for next time
                if (process.env.NODE_ENV === 'development') {
                    console.log('📅 Single-day selection applied:', tempRange.from.toISOString());
                }
            }

            // Apply the valid range
            onChange?.(tempRange);
            setIsOpen(false);
        } catch (error) {
            console.error('MainFilterCalendar: Error in onChange callback:', error);
            setValidationError('Error al aplicar la selección');
        }
    }, [onChange, tempRange]);

    /**
     * Cancels the current selection and reverts to the original value.
     * Resets temporary range to the external value or default range.
     * Clears any validation errors.
     */
    const handleCancel = React.useCallback(() => {
        const rangeToUse = value || defaultRange;
        setTempRange(rangeToUse);
        setValidationError(null); // Clear validation errors
        setIsOpen(false);
    }, [value, defaultRange, setTempRange]);

    return (
        <div className="flex w-full items-center gap-2">
            <div className="flex-1">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                'h-9 w-full justify-start px-3 py-1 text-left font-medium',
                                'border-border bg-card hover:border-border hover:bg-muted',
                                'shadow-sm transition-colors',
                                !currentValue && 'text-muted-foreground',
                            )}
                            aria-label={`Filtro de fechas: ${displayText}`}
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                        >
                            <Calendar className="mr-3 h-4 w-4 text-primary" aria-hidden="true" />
                            <span className="flex-1 text-foreground">{displayText}</span>
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                        sideOffset={4}
                        role="dialog"
                        aria-label="Selector de rango de fechas"
                    >
                        <div className="rounded-lg border border-border bg-card shadow-xl">
                            {/* Period Selector Section */}
                            <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

                            {/* Calendar Section */}
                            <CalendarView
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                tempRange={tempRange}
                                onPreviousMonth={handlePreviousMonth}
                                onNextMonth={handleNextMonth}
                                onDayClick={handleDayClick}
                            />

                            {/* Validation error message */}
                            {validationError && (
                                <div className="border-t border-border bg-red-50 px-6 py-3">
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>{validationError}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-red-500">
                                        Para seleccionar un solo día, haz clic dos veces en la misma fecha
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/50 px-6 py-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="h-9 border-border px-6 py-2 text-sm font-medium text-foreground hover:border-border hover:bg-muted"
                                    aria-label="Cancelar selección de fechas"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleApply}
                                    className="h-9 bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
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
