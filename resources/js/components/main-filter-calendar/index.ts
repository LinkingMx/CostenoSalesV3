/**
 * Main Filter Calendar Component Library
 * 
 * A comprehensive date range selection component with Spanish localization,
 * featuring quick period selection and interactive calendar functionality.
 * 
 * @fileoverview This module exports the complete MainFilterCalendar component suite
 * including the main component, TypeScript types, utility functions, and hooks.
 * 
 * @example
 * ```tsx
 * import { MainFilterCalendar, type DateRange } from '@/components/main-filter-calendar';
 * 
 * function MyComponent() {
 *   const [dateRange, setDateRange] = useState<DateRange>();
 *   
 *   return (
 *     <MainFilterCalendar 
 *       value={dateRange}
 *       onChange={setDateRange}
 *       onRefresh={() => refetchData()}
 *     />
 *   );
 * }
 * ```
 */

// Main export for main-filter-calendar component
export { MainFilterCalendar } from './main-filter-calendar';

// Export TypeScript interfaces and types for external usage
export type { 
  DateRange, 
  MainFilterCalendarProps,
  PeriodKey,
  PeriodOption,
  PeriodGroup 
} from './types';

// Export utility functions that might be useful for consumers
export { 
  formatDate, 
  formatDateRange, 
  getDateRange,
  SPANISH_MONTHS,
  SPANISH_DAYS 
} from './utils';

// Export custom hook for advanced usage scenarios
export { useDateRange } from './hooks/use-date-range';