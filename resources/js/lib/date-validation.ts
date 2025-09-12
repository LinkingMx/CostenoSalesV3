import type { DateRange } from '@/components/main-filter-calendar';

/**
 * Checks if the selected date range represents a complete month.
 * Returns true when the date range spans exactly from the first day to the last day of a single month.
 * 
 * @function isCompleteMonthSelected
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one complete month is selected, false otherwise
 * 
 * @example
 * const completeMonth = { from: new Date('2025-09-01'), to: new Date('2025-09-30') };     // Sept 1-30
 * const partialMonth = { from: new Date('2025-09-05'), to: new Date('2025-09-30') };     // Missing first days
 * const twoMonths = { from: new Date('2025-09-01'), to: new Date('2025-10-31') };        // Two months
 * 
 * isCompleteMonthSelected(completeMonth); // true
 * isCompleteMonthSelected(partialMonth);  // false
 * isCompleteMonthSelected(twoMonths);     // false
 * isCompleteMonthSelected(undefined);     // false
 */
export function isCompleteMonthSelected(dateRange: DateRange | undefined): boolean {
  if (!dateRange?.from || !dateRange?.to) {
    return false;
  }
  
  // Create normalized date objects to ignore time components
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  
  // Normalize to midnight (00:00:00.000) to remove time influence
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  
  // Check if from date is the first day of the month
  if (fromDate.getDate() !== 1) {
    return false;
  }
  
  // Check if to date is the last day of the same month as from date
  const expectedLastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
  expectedLastDay.setHours(0, 0, 0, 0);
  
  // Both dates must be in the same month and year
  if (fromDate.getMonth() !== toDate.getMonth() || fromDate.getFullYear() !== toDate.getFullYear()) {
    return false;
  }
  
  // To date must be the last day of the month
  if (toDate.getTime() !== expectedLastDay.getTime()) {
    return false;
  }
  
  return true;
}

/**
 * Checks if the selected date range represents a complete week (Monday to Sunday).
 * Returns true when the date range spans exactly 7 consecutive days from Monday to Sunday.
 * 
 * @function isCompleteWeekSelected  
 * @param {DateRange | undefined} dateRange - The date range to check
 * @returns {boolean} True if exactly one complete week is selected, false otherwise
 */
export function isCompleteWeekSelected(dateRange: DateRange | undefined): boolean {
  if (!dateRange?.from || !dateRange?.to) {
    return false;
  }
  
  const fromDay = dateRange.from.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const toDay = dateRange.to.getDay();
  
  // Calculate the difference in days
  const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Must be exactly 6 days difference (7 days = 6 day difference)
  if (daysDiff !== 6) {
    return false;
  }
  
  // Accept two week formats:
  // 1. Monday to Sunday: fromDay === 1 (Monday) AND toDay === 0 (Sunday)
  // 2. Sunday to Saturday: fromDay === 0 (Sunday) AND toDay === 6 (Saturday)
  return (fromDay === 1 && toDay === 0) || (fromDay === 0 && toDay === 6);
}