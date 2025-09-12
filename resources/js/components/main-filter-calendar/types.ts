/**
 * Date range interface representing a period between two dates.
 * Used throughout the calendar component for date selection and display.
 * 
 * @interface DateRange
 * @property {Date} [from] - The start date of the range (optional for incomplete selections)
 * @property {Date} [to] - The end date of the range (optional for single-date or incomplete selections)
 * 
 * @example
 * // Single day selection
 * const singleDay: DateRange = { from: new Date('2025-01-15'), to: new Date('2025-01-15') };
 * 
 * // Date range selection
 * const range: DateRange = { from: new Date('2025-01-15'), to: new Date('2025-01-20') };
 * 
 * // Incomplete selection (pending end date)
 * const pending: DateRange = { from: new Date('2025-01-15') };
 */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Represents a single period option in the quick date selection dropdown.
 * Used for both predefined periods (today, yesterday, etc.) and custom selections.
 * 
 * @interface PeriodOption
 * @property {string} value - Unique identifier for the period (matches PeriodKey values)
 * @property {string} label - Human-readable Spanish label displayed to users
 * 
 * @example
 * const todayOption: PeriodOption = { value: 'today', label: 'Hoy' };
 */
export interface PeriodOption {
  value: string;
  label: string;
}

/**
 * Groups related period options together in the dropdown for better organization.
 * Creates visual sections like 'Diarios', 'Semanales', 'Mensuales' in the UI.
 * 
 * @interface PeriodGroup
 * @property {string} label - Spanish category label (e.g., 'Diarios', 'Semanales')
 * @property {PeriodOption[]} options - Array of period options belonging to this group
 * 
 * @example
 * const dailyGroup: PeriodGroup = {
 *   label: 'Diarios',
 *   options: [
 *     { value: 'today', label: 'Hoy' },
 *     { value: 'yesterday', label: 'Ayer' }
 *   ]
 * };
 */
export interface PeriodGroup {
  label: string;
  options: PeriodOption[];
}

/**
 * Union type defining all valid predefined period keys.
 * Each key corresponds to a specific date range calculation in the utils.
 * 
 * @typedef {string} PeriodKey
 * 
 * @description Valid values:
 * - 'today': Current date (from and to are the same)
 * - 'yesterday': Previous day
 * - 'thisWeek': Monday to Sunday of current week
 * - 'lastWeek': Monday to Sunday of previous week  
 * - 'thisMonth': First to last day of current month
 * - 'lastMonth': First to last day of previous month
 * - 'custom': User-defined date range via calendar interaction
 * 
 * @example
 * // Getting a predefined date range
 * const todayRange = getDateRange('today');
 * const thisWeekRange = getDateRange('thisWeek');
 */
export type PeriodKey = 
  | 'today' 
  | 'yesterday' 
  | 'thisWeek' 
  | 'lastWeek' 
  | 'thisMonth' 
  | 'lastMonth'
  | 'custom';

/**
 * Props for the MainFilterCalendar component.
 * Provides a complete date range selection interface with Spanish localization.
 * 
 * @interface MainFilterCalendarProps
 * @property {DateRange} [value] - Current selected date range (controlled component)
 * @property {function} [onChange] - Callback fired when date range changes
 * @property {string} [placeholder='Seleccionar fechas'] - Text shown when no date is selected
 * @property {function} [onRefresh] - Callback for refresh button click (defaults to page reload)
 * 
 * @example
 * ```tsx
 * <MainFilterCalendar 
 *   value={dateRange}
 *   onChange={setDateRange}
 *   placeholder="Seleccione un período"
 *   onRefresh={() => refetchData()}
 * />
 * ```
 */
export interface MainFilterCalendarProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  onRefresh?: () => void;
}

/**
 * Props for the PeriodSelector dropdown component.
 * Handles quick period selection with grouped options.
 * 
 * @interface PeriodSelectorProps
 * @property {string} selectedPeriod - Currently selected period key
 * @property {function} onPeriodChange - Callback when user selects a different period
 * 
 * @example
 * ```tsx
 * <PeriodSelector 
 *   selectedPeriod="today"
 *   onPeriodChange={(period) => handlePeriodChange(period)}
 * />
 * ```
 */
export interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

/**
 * Props for the CalendarView component.
 * Renders an interactive monthly calendar with date range selection.
 * 
 * @interface CalendarViewProps
 * @property {number} currentMonth - Zero-based month index (0 = January)
 * @property {number} currentYear - Four-digit year number
 * @property {DateRange | undefined} tempRange - Temporary date range during selection
 * @property {function} onPreviousMonth - Navigate to previous month
 * @property {function} onNextMonth - Navigate to next month  
 * @property {function} onDayClick - Handle day selection, receives day number (1-31)
 * 
 * @example
 * ```tsx
 * <CalendarView 
 *   currentMonth={0} // January
 *   currentYear={2025}
 *   tempRange={tempDateRange}
 *   onPreviousMonth={() => goToPreviousMonth()}
 *   onNextMonth={() => goToNextMonth()}
 *   onDayClick={(day) => selectDay(day)}
 * />
 * ```
 */
export interface CalendarViewProps {
  currentMonth: number;
  currentYear: number;
  tempRange: DateRange | undefined;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: number) => void;
}

/**
 * Props for the RefreshButton component.
 * Simple button for triggering data refresh or page reload.
 * 
 * @interface RefreshButtonProps
 * @property {function} onRefresh - Callback executed when refresh button is clicked
 * 
 * @example
 * ```tsx
 * <RefreshButton onRefresh={() => location.reload()} />
 * ```
 */
export interface RefreshButtonProps {
  onRefresh: () => void;
}

/**
 * Return type for the useDateRange custom hook.
 * Provides state management and event handlers for date range selection.
 * 
 * @interface UseDateRangeReturn
 * @property {DateRange | undefined} tempRange - Temporary date range during selection process
 * @property {function} setTempRange - React state setter for tempRange
 * @property {string} selectedPeriod - Currently selected period key (today, thisWeek, custom, etc.)
 * @property {function} setSelectedPeriod - React state setter for selectedPeriod
 * @property {number} currentMonth - Zero-based month being displayed in calendar (0 = January)
 * @property {function} setCurrentMonth - React state setter for currentMonth
 * @property {number} currentYear - Four-digit year being displayed in calendar
 * @property {function} setCurrentYear - React state setter for currentYear
 * @property {function} handlePeriodChange - Handler for period dropdown changes
 * @property {function} handleDayClick - Handler for calendar day clicks
 * @property {function} handlePreviousMonth - Handler for previous month navigation
 * @property {function} handleNextMonth - Handler for next month navigation
 * 
 * @example
 * ```tsx
 * const {
 *   tempRange,
 *   selectedPeriod,
 *   handlePeriodChange,
 *   handleDayClick
 * } = useDateRange({ value: dateRange });
 * ```
 */
export interface UseDateRangeReturn {
  tempRange: DateRange | undefined;
  setTempRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  selectedPeriod: string;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<string>>;
  currentMonth: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  currentYear: number;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  handlePeriodChange: (period: string) => void;
  handleDayClick: (day: number) => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
}