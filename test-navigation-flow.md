# Navigation Flow Test Instructions

## Test Scenario: Dashboard → Branch → Dashboard Navigation

### Prerequisites
1. Open Chrome DevTools Console (F12)
2. Clear session storage: `sessionStorage.clear()`
3. Refresh the page

### Test Steps

#### Step 1: Initial Dashboard Load
1. Navigate to Dashboard
2. **Expected Console Logs:**
   - `🔵 [useDashboardState] No stored state, initializing fresh`
   - `🟦 [Dashboard] Initialization effect running`
   - `ℹ️ [Dashboard] No initialization needed, waiting for user selection`

#### Step 2: Select a Date
1. Select today's date from the calendar
2. **Expected Console Logs:**
   - `📅 [Dashboard] handleDateChange called`
   - `🔵 [useDashboardState] setOriginalDateRange called`
   - `💾 [useDashboardState] Saved to session storage`
   - `📅 [Dashboard] Setting original date range (user selection)`

#### Step 3: Navigate to a Branch
1. Click on any branch in DailySalesBranches
2. **Expected Console Logs:**
   - `🔄 [BranchCollapsible] Setting/updating originalDateRange for navigation`
   - `💾 [useDashboardState] Saved to session storage`

#### Step 4: Return to Dashboard
1. Click the back button in BranchDetails
2. **Expected Console Logs:**
   - `🔧 RESTORING original date range`
   - `🟢 [useDashboardState] restoreOriginalDateRange called`
   - `🔧 VALID original date found, navigating with restore params`
   - **NOT**: `🔧 NO valid original date found, using fallback navigation`

#### Step 5: Verify Dashboard State
1. The Dashboard should load with the SAME date that was originally selected
2. **Expected Console Logs:**
   - `🔍 [useDashboardState] Loading from session storage`
   - `🟢 [useDashboardState] Restored state`
   - `✅ [Dashboard] Restored date from BranchDetails return`

### Success Criteria
- ✅ Original date is preserved when navigating to branch
- ✅ Original date is restored when returning to dashboard
- ✅ No "NO valid original date found" warning
- ✅ No "Invalid or empty branches data" warning (unless genuinely no data)
- ✅ Session storage contains both originalDateRange and currentDateRange

### Debugging Commands

```javascript
// Check session storage state
JSON.parse(sessionStorage.getItem('dashboard_state'))

// Check if dates are properly stored
const state = JSON.parse(sessionStorage.getItem('dashboard_state'));
console.log('Original:', state.originalDateRange);
console.log('Current:', state.currentDateRange);

// Clear session storage for fresh test
sessionStorage.clear();
location.reload();
```

## Common Issues Fixed

1. **Session Storage Date Serialization**: Dates are now properly converted to/from ISO strings
2. **Race Conditions**: Dashboard initialization is now properly sequenced with refs
3. **Original Date Preservation**: Always set when user makes a selection on dashboard
4. **Branch Navigation**: Properly preserves original date when navigating
5. **Validation Warnings**: Only shown when actually relevant, not during loading

## Console Log Legend

- 🔵 Blue Circle: Initialization/Setup
- 🟢 Green Circle: Success/Restore
- 🔴 Red Circle: Error/Missing data
- 📅 Calendar: Date selection
- 💾 Floppy: Session storage save
- 🔧 Wrench: Navigation/restore operation
- ✅ Check: Success confirmation
- ❌ Cross: Error
- ⚠️ Warning: Non-critical issue
- ℹ️ Info: Informational message
- 🟦 Blue Square: Component lifecycle
- 🔄 Refresh: Update/change operation