import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import * as React from 'react';
import type { PeriodSelectorProps } from '../types';
import { CUSTOM_OPTION, PERIOD_GROUPS } from '../utils';

/**
 * PeriodSelector - Dropdown component for quick date range selection.
 *
 * Provides grouped options for common date periods (daily, weekly, monthly)
 * with a custom option for manual calendar selection. Features Spanish
 * localization and organized grouping for better user experience.
 *
 * @component
 * @param {PeriodSelectorProps} props - Component props
 * @returns {JSX.Element} Select dropdown with period options
 *
 * @description Period groups:
 * - Custom: Manual calendar selection
 * - Diarios: Today, Yesterday
 * - Semanales: This week, Last week
 * - Mensuales: This month, Last month
 *
 * @example
 * ```tsx
 * <PeriodSelector
 *   selectedPeriod="today"
 *   onPeriodChange={(period) => handlePeriodChange(period)}
 * />
 * ```
 */
export const PeriodSelector = React.memo<PeriodSelectorProps>(({ selectedPeriod, onPeriodChange }) => {
    return (
        <div className="border-b border-border px-6 py-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground" id="period-selector-heading">
                Selección de período rápido
            </h3>
            <Select value={selectedPeriod} onValueChange={onPeriodChange} aria-labelledby="period-selector-heading">
                <SelectTrigger
                    className="h-10 w-full border-border bg-muted transition-colors hover:bg-muted/80"
                    aria-label="Seleccionar período de tiempo"
                >
                    <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent className="w-[380px]" role="listbox">
                    {/* Custom date option at the top */}
                    <SelectItem
                        value={CUSTOM_OPTION.value}
                        className="px-3 py-1.5 font-medium text-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                        aria-label="Seleccionar fechas personalizadas usando el calendario"
                    >
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                            <span>Fechas personalizadas</span>
                        </span>
                    </SelectItem>

                    <SelectSeparator className="my-0.5 bg-border" />

                    {/* Grouped period options with semantic organization */}
                    {PERIOD_GROUPS.map((group, index) => (
                        <React.Fragment key={group.label}>
                            <SelectGroup role="group" aria-labelledby={`group-${group.label}`}>
                                <SelectLabel
                                    id={`group-${group.label}`}
                                    className="border-b border-border bg-muted px-3 py-1 text-xs font-bold tracking-wider text-muted-foreground uppercase"
                                >
                                    {group.label}
                                </SelectLabel>
                                {group.options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                                        aria-label={`Seleccionar período: ${option.label}`}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                            {index < PERIOD_GROUPS.length - 1 && <SelectSeparator className="my-0.5 bg-border" role="separator" />}
                        </React.Fragment>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
});

// Set display name for debugging
PeriodSelector.displayName = 'PeriodSelector';
