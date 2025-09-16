import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import type { CalendarViewProps } from '../types';
import {
    SPANISH_DAYS,
    SPANISH_MONTHS,
    getDaysInMonth,
    getFirstDayOfMonth,
    isInRange,
    isPendingStart,
    isRangeEnd,
    isRangeStart,
    isSelected,
    isToday,
} from '../utils';

/**
 * CalendarView - Interactive monthly calendar component for date range selection.
 *
 * Renders a full calendar grid with Spanish day labels and month navigation.
 * Supports single date and date range selection with visual feedback for
 * different selection states (today, selected, pending, in-range).
 *
 * @component
 * @param {CalendarViewProps} props - Calendar configuration and event handlers
 * @returns {JSX.Element} Interactive calendar grid with navigation
 *
 * @description Visual states:
 * - Today: Orange border for clear distinction from selections
 * - Pending start: Primary color with pulsing orange indicator for incomplete range
 * - Range start/end: Primary color highlighting for range endpoints
 * - In range: Subtle background for dates between start and end
 * - Range connections: Visual continuity between range dates
 *
 * @example
 * ```tsx
 * <CalendarView
 *   currentMonth={0} // January
 *   currentYear={2025}
 *   tempRange={selectedRange}
 *   onPreviousMonth={() => navigateToPrevious()}
 *   onNextMonth={() => navigateToNext()}
 *   onDayClick={(day) => handleDaySelection(day)}
 * />
 * ```
 */
export function CalendarView({ currentMonth, currentYear, tempRange, onPreviousMonth, onNextMonth, onDayClick }: CalendarViewProps) {
    // Calculate calendar layout parameters
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Memoize calendar grid generation for performance
    const calendarDays = React.useMemo(() => {
        const days = [];

        // Empty cells for days before month starts (Monday-first layout)
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8" aria-hidden="true" />);
        }

        // Generate clickable day buttons for the month
        for (let day = 1; day <= daysInMonth; day++) {
            // Calculate all day states for styling and accessibility
            const dayIsToday = isToday(day, currentMonth, currentYear);
            const dayIsSelected = isSelected(day, currentMonth, currentYear, tempRange);
            const dayIsRangeStart = isRangeStart(day, currentMonth, currentYear, tempRange);
            const dayIsRangeEnd = isRangeEnd(day, currentMonth, currentYear, tempRange);
            const dayIsInRange = isInRange(day, currentMonth, currentYear, tempRange);
            const dayIsPendingStart = isPendingStart(day, currentMonth, currentYear, tempRange);

            // Create accessible day button with comprehensive ARIA labels
            const dayDate = new Date(currentYear, currentMonth, day);
            const formattedDate = dayDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            let ariaLabel = formattedDate;
            if (dayIsToday) ariaLabel += ', hoy';
            if (dayIsSelected) ariaLabel += ', seleccionado';
            if (dayIsPendingStart) ariaLabel += ', inicio de rango pendiente';
            if (dayIsRangeStart) ariaLabel += ', inicio de rango';
            if (dayIsRangeEnd) ariaLabel += ', fin de rango';
            if (dayIsInRange) ariaLabel += ', en rango seleccionado';

            days.push(
                <div key={day} className="relative">
                    <button
                        onClick={() => onDayClick(day)}
                        className={cn(
                            // Base button styles with focus management
                            'focus:ring-opacity-50 relative z-10 h-9 w-9 rounded-md text-sm font-medium',
                            'transition-all hover:bg-muted focus:ring-2 focus:ring-primary focus:outline-none',
                            // Today styling with distinctive orange border (when not selected)
                            dayIsToday && !dayIsSelected && 'bg-background font-semibold text-foreground ring-2 ring-orange-500 hover:bg-muted',
                            // Pending start date (first click, waiting for end date)
                            dayIsPendingStart &&
                                'bg-primary font-semibold text-primary-foreground shadow-md ring-2 ring-primary/50 hover:bg-primary/90',
                            // Range start and end dates
                            (dayIsRangeStart || dayIsRangeEnd) &&
                                !dayIsPendingStart &&
                                'bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary/90',
                            // Dates in between range
                            dayIsInRange && 'bg-muted text-foreground hover:bg-muted/80',
                            // Today when it's part of selection - orange border over selection styling
                            dayIsToday && (dayIsSelected || dayIsInRange) && 'ring-2 ring-orange-500',
                        )}
                        aria-label={ariaLabel}
                        aria-pressed={dayIsSelected || dayIsInRange}
                        type="button"
                    >
                        {day}
                    </button>

                    {/* Range connection background for visual continuity */}
                    {dayIsInRange && <div className="absolute inset-0 -z-10 bg-primary/10" />}

                    {/* Pending start indicator - visual hint for incomplete range */}
                    {dayIsPendingStart && <div className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-orange-500" />}
                </div>,
            );
        }

        return days;
    }, [currentMonth, currentYear, daysInMonth, firstDay, tempRange, onDayClick]);

    return (
        <div className="px-6 py-5">
            {/* Month navigation with accessibility labels */}
            <div className="mb-5 flex items-center justify-between" role="banner" aria-label="Navegación de calendario">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPreviousMonth}
                    className="h-9 w-9 rounded-md p-0 hover:bg-muted"
                    aria-label="Mes anterior"
                    type="button"
                >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Button>

                <h4 className="text-base font-semibold text-foreground capitalize" aria-live="polite" id="calendar-month-year">
                    {SPANISH_MONTHS[currentMonth]} {currentYear}
                </h4>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNextMonth}
                    className="h-9 w-9 rounded-md p-0 hover:bg-muted"
                    aria-label="Mes siguiente"
                    type="button"
                >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Button>
            </div>

            {/* Day headers with semantic markup */}
            <div className="mb-3 grid grid-cols-7 gap-1" role="row" aria-labelledby="calendar-month-year">
                {SPANISH_DAYS.map((day, index) => (
                    <div
                        key={day}
                        className="flex h-9 items-center justify-center text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                        role="columnheader"
                        aria-label={`Columna ${index + 1}: ${day}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid with semantic grid structure */}
            <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="calendar-month-year">
                {calendarDays}
            </div>
        </div>
    );
}
