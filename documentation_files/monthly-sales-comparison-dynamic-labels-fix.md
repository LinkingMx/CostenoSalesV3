# Monthly Sales Comparison - Dynamic Labels Fix

## Issue Description

The `monthly-sales-comparison` component was displaying hardcoded month labels instead of dynamically calculating them based on the selected date range. When August 2025 was selected (1 ago - 31 ago, 2025), the component incorrectly showed:

- Julio 2025
- Agosto 2025
- Septiembre 2025

Instead of the correct chronological sequence:

- Junio 2025 (two months ago)
- Julio 2025 (previous month)
- Agosto 2025 (selected month)

## Root Cause

The `transformApiDataToMonthlySummary` function in `utils.ts` was using hardcoded Spanish month names that didn't adapt to the selected date range context.

## Solution Implemented

### 1. Enhanced `transformApiDataToMonthlySummary` Function

**File**: `resources/js/components/monthly-sales-comparison/utils.ts`

- Added optional `selectedDateRange` parameter for dynamic month calculation
- Implemented dynamic month calculation logic based on the selected date
- API data mapping clarification:
  - `actual` = selected/filtered month
  - `last` = previous month
  - `two_las` = two months ago

```typescript
export function transformApiDataToMonthlySummary(
  apiData: unknown,
  selectedDateRange?: DateRange
): MonthlySummaryData[]
```

### 2. Updated Component Integration

**File**: `resources/js/components/monthly-sales-comparison/monthly-sales-comparison.tsx`

- Modified `useMemo` to pass `selectedDateRange` to transformation function
- Added dependency for proper re-calculation when date changes
- Updated `getMonthLetter` function to extract from dynamic month names

### 3. Dynamic Month Calculation Logic

```typescript
// Calculate months relative to selected date
if (selectedDateRange?.from) {
  latestMonth = new Date(selectedDateRange.from);           // August 2025
  previousMonth = new Date(..., month - 1, ...);            // July 2025
  twoMonthsAgo = new Date(..., month - 2, ...);            // June 2025
}

// Map API data to chronological order
// two_las → twoMonthsAgo (June)
// last → previousMonth (July)
// actual → latestMonth (August)
```

## Files Modified

1. **`resources/js/components/monthly-sales-comparison/utils.ts`**
   - Enhanced `transformApiDataToMonthlySummary` function signature
   - Added dynamic month calculation logic
   - Improved API data mapping documentation

2. **`resources/js/components/monthly-sales-comparison/monthly-sales-comparison.tsx`**
   - Updated component to pass `selectedDateRange` to transformation
   - Fixed `getMonthLetter` to work with dynamic month names
   - Added proper dependency tracking in `useMemo`

## Expected Behavior

Now when any complete month is selected:

- **August 2025 selected** → Shows: Junio 2025, Julio 2025, Agosto 2025
- **September 2025 selected** → Shows: Julio 2025, Agosto 2025, Septiembre 2025
- **January 2025 selected** → Shows: Noviembre 2024, Diciembre 2024, Enero 2025

## Testing Verified

✅ Month labels update correctly when changing date selection
✅ Chronological order maintained (oldest → newest)
✅ Spanish month names display properly
✅ Component re-renders when `selectedDateRange` changes
✅ Circular indicators show correct first letters (J, J, A for June, July, August)

## API Data Structure

The component expects API data in this format:

```json
{
  "data": {
    "range": {
      "actual": 245512460.24,    // Selected month total
      "last": 228086400.35,      // Previous month total
      "two_las": 206902314.55    // Two months ago total
    }
  }
}
```

## Performance Considerations

- Used `React.useMemo` with proper dependencies to prevent unnecessary recalculations
- Month name generation is done once per date range change
- Component only re-renders when `selectedDateRange` or `rawApiData` changes

## Future Enhancements

- Consider adding year boundary handling for cross-year scenarios
- Add validation for date range completeness
- Consider caching month calculations for frequently used ranges