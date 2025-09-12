import type { DayPickerProps } from 'react-day-picker';

/**
 * Base props that all datepicker components share
 */
export interface BaseDatePickerProps {
  /** Optional CSS class name */
  className?: string;
  /** Whether the datepicker is disabled */
  disabled?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Custom date format for display */
  displayFormat?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of disabled dates */
  disabledDates?: Date[];
  /** Function to disable specific dates */
  disableDayPredicate?: (date: Date) => boolean;
  /** Whether to show week numbers */
  showWeekNumbers?: boolean;
  /** First day of the week (0 = Sunday, 1 = Monday, etc.) */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Locale for date formatting */
  locale?: Locale;
  /** Custom modifiers for styling specific dates */
  modifiers?: Record<string, Date[] | ((date: Date) => boolean)>;
  /** Custom styles for modifiers */
  modifiersStyles?: Record<string, React.CSSProperties>;
  /** Custom class names for modifiers */
  modifiersClassNames?: Record<string, string>;
}

/**
 * Single date selection props
 */
export interface SingleDatePickerProps extends BaseDatePickerProps {
  /** Selected date value */
  value?: Date | string | null;
  /** Callback when date is selected */
  onChange?: (date: Date | undefined) => void;
  /** Default selected date */
  defaultValue?: Date | string | null;
  /** Whether to close the calendar after selecting a date */
  closeOnSelect?: boolean;
}

/**
 * Date range selection props
 */
export interface DateRangePickerProps extends BaseDatePickerProps {
  /** Selected date range */
  value?: DateRange;
  /** Callback when date range is selected */
  onChange?: (range: DateRange | undefined) => void;
  /** Default selected date range */
  defaultValue?: DateRange;
  /** Number of months to display */
  numberOfMonths?: number;
  /** Whether to allow selection of the same date for start and end */
  allowSingleDayRange?: boolean;
}

/**
 * Date range type
 */
export interface DateRange {
  /** Start date of the range */
  from?: Date;
  /** End date of the range */
  to?: Date;
}

/**
 * Calendar popup props
 */
export interface CalendarPopoverProps {
  /** Whether the popover is open */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Trigger element props */
  trigger?: React.ReactNode;
  /** Alignment of the popover */
  align?: 'start' | 'center' | 'end';
  /** Side of the trigger to show the popover */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Offset from the trigger */
  sideOffset?: number;
}

/**
 * Calendar component props extending react-day-picker
 */
export interface CalendarProps extends Omit<DayPickerProps, 'mode' | 'selected' | 'onSelect'> {
  /** Calendar mode - single or range */
  mode?: 'single' | 'range';
  /** Selected date(s) */
  selected?: Date | DateRange;
  /** Callback when selection changes */
  onSelect?: (date: Date | DateRange | undefined) => void;
  /** Custom class name for the calendar */
  className?: string;
}

/**
 * Preset date range options
 */
export interface DateRangePreset {
  /** Display label for the preset */
  label: string;
  /** The date range this preset represents */
  range: DateRange;
  /** Optional description */
  description?: string;
}

/**
 * Date input props for controlled input fields
 */
export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Current date value */
  value?: Date | string | null;
  /** Callback when value changes */
  onChange?: (date: Date | undefined) => void;
  /** Date format for display */
  format?: string;
  /** Whether the input has an error */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Custom class name */
  className?: string;
}

/**
 * Date picker variant types
 */
export type DatePickerVariant = 'default' | 'outline' | 'ghost';

/**
 * Date picker size types
 */
export type DatePickerSize = 'sm' | 'md' | 'lg';

/**
 * Extended calendar props with additional customization
 */
export interface ExtendedCalendarProps extends CalendarProps {
  /** Show today button */
  showToday?: boolean;
  /** Show clear button */
  showClear?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Custom header content */
  header?: React.ReactNode;
  /** Whether to show outside days */
  showOutsideDays?: boolean;
  /** Custom day render function */
  renderDay?: (date: Date) => React.ReactNode;
}

/**
 * Date picker context type
 */
export interface DatePickerContextValue {
  /** Current locale */
  locale?: Locale;
  /** Default format string */
  defaultFormat: string;
  /** Timezone */
  timezone?: string;
}

/**
 * Locale type (from date-fns)
 */
export interface Locale {
  code?: string;
  formatDistance?: (...args: unknown[]) => string;
  formatRelative?: (...args: unknown[]) => string;
  localize?: Record<string, unknown>;
  formatLong?: Record<string, unknown>;
  options?: {
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  };
}