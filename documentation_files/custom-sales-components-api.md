# Custom Sales Components - API Documentation

## Component APIs

### CustomSalesComparison

#### Props Interface
```typescript
interface CustomSalesComparisonProps {
  selectedDateRange: DateRange | undefined;
  salesData?: SalesCustomData[];
}
```

#### Usage Examples
```tsx
import { CustomSalesComparison } from '@/components/custom-sales-comparison';

// Basic usage with date range (uses mock data)
<CustomSalesComparison 
  selectedDateRange={{ 
    from: new Date('2025-09-01'), 
    to: new Date('2025-09-15') 
  }}
/>

// With custom sales data
<CustomSalesComparison 
  selectedDateRange={dateRange}
  salesData={[
    {
      date: new Date('2025-09-01'),
      amount: 45250.75,
      isInRange: true,
      dayName: 'Domingo',
      formattedDate: '01 Sep'
    }
  ]}
/>

// Will return null for non-custom ranges
<CustomSalesComparison 
  selectedDateRange={{ 
    from: new Date('2025-09-01'), 
    to: new Date('2025-09-01') // Single day - returns null
  }}
/>
```

#### Behavior
- **Conditional Rendering**: Returns `null` if not a custom range
- **Data Priority**: Custom `salesData` > generated mock data
- **Validation**: Runtime validation with console logging
- **Memoization**: Header and card components are memoized for performance

---

### CustomSalesBranches

#### Props Interface
```typescript
interface CustomSalesBranchesProps {
  selectedDateRange?: DateRange;
  branches?: BranchCustomSalesData[];
}
```

#### Usage Examples
```tsx
import { CustomSalesBranches } from '@/components/custom-sales-branches';

// Basic usage with mock data
<CustomSalesBranches 
  selectedDateRange={customRange}
/>

// With custom branch data
<CustomSalesBranches 
  selectedDateRange={customRange}
  branches={[
    {
      id: '5',
      name: 'Lázaro y Diego',
      location: 'Metropolitan',
      totalSales: 84326.60,
      percentage: 18.3,
      openAccounts: 7490.60,
      closedSales: 76836.00,
      averageTicket: 389.78,
      totalTickets: 112,
      avatar: 'L'
    }
  ]}
/>
```

#### Behavior
- **Conditional Rendering**: Returns `null` if not a custom range
- **Default Data**: Uses `DUMMY_CUSTOM_BRANCHES_DATA` if no branches provided
- **Collapsible Items**: Each branch renders as independent collapsible
- **Performance**: No heavy memoization due to simpler data structure

---

## Type Definitions

### Core Data Types

#### SalesCustomData
```typescript
interface SalesCustomData {
  date: Date;                // Specific date for sales record
  amount: number;            // Sales amount in Mexican pesos
  isInRange: boolean;        // Whether date falls within selected range
  dayName: string;           // Spanish day name ("Lunes", "Martes")
  formattedDate: string;     // Display format ("15 Sep")
}
```

#### BranchCustomSalesData
```typescript
interface BranchCustomSalesData {
  id: string;                // Unique branch identifier
  name: string;              // Human-readable branch name
  location?: string;         // Optional location/city
  totalSales: number;        // Total sales in USD
  percentage: number;        // Growth percentage (can be negative)
  openAccounts: number;      // Pending transaction amounts
  closedSales: number;       // Completed transaction amounts
  averageTicket: number;     // Average per transaction
  totalTickets: number;      // Total number of transactions
  avatar: string;            // Single character for display
  dailyAverage: number;      // Average daily sales (custom-sales-comparison only)
  bestDay: Date;             // Highest sales date (custom-sales-comparison only)
  bestDayAmount: number;     // Best day sales amount (custom-sales-comparison only)
}
```

#### DateRange
```typescript
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
}
```

### Validation Types

#### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean;          // Overall validation status
  errors: string[];          // Critical errors preventing usage
  warnings: string[];        // Non-critical issues for logging
  metadata: {                // Debug and context information
    validatedAt: Date;
    source: string;
    itemCount?: number;
    rangeDays?: number;
  };
}
```

---

## Utility Functions

### Date and Range Utilities

#### isCustomRangeSelected
```typescript
function isCustomRangeSelected(dateRange: DateRange | undefined): boolean
```
Determines if a date range represents a custom selection (not single day, complete week, or complete month).

#### generateMockCustomSalesData
```typescript
function generateMockCustomSalesData(dateRange: DateRange): SalesCustomData[]
```
Generates realistic mock sales data for a custom range with business day patterns.

#### generateMockCustomSalesDataWithSeasonal
```typescript
function generateMockCustomSalesDataWithSeasonal(
  dateRange: DateRange, 
  baseAmount: number = 850000
): SalesCustomData[]
```
Enhanced mock data generation with seasonal variations for different months.

### Validation Functions

#### validateCustomSalesData
```typescript
function validateCustomSalesData(salesData: SalesCustomData[]): ValidationResult
```
Comprehensive validation of custom sales data array.

**Validation Rules:**
- Array must contain 2-365 items
- Each item must have valid Date object
- Amounts must be non-negative numbers
- String fields must be non-empty
- Date continuity checks with gap warnings

#### validateCustomDateRange
```typescript
function validateCustomDateRange(dateRange: DateRange | undefined): ValidationResult
```
Validates date range for custom component requirements.

**Validation Rules:**
- Both from/to dates required and valid
- Must be custom range (not standard patterns)
- Range between 2-365 days
- Future date warnings
- Large range performance warnings (>90 days)

#### validateCustomBranchSalesData
```typescript
function validateCustomBranchSalesData(branchData: BranchCustomSalesData[]): ValidationResult
```
Validates branch sales data array with business logic checks.

**Validation Rules:**
- Non-empty array with valid branch objects
- Required fields validation (id, name, avatar)
- Numeric field validation (non-negative where appropriate)
- Business logic validation (totalSales = openAccounts + closedSales)
- Average ticket calculation validation
- Duplicate ID detection

### Formatting Functions

#### formatSalesAmount
```typescript
function formatSalesAmount(
  amount: number, 
  currency: 'MXN' | 'USD' | 'COP' = 'MXN'
): string
```
Formats monetary amounts with locale-specific currency display.

**Examples:**
- `formatSalesAmount(125533.98)` → `"$125,533.98"`
- `formatSalesAmount(2568720.45, 'USD')` → `"$2,568,720.45"`

#### formatCurrency
```typescript
function formatCurrency(amount: number): string
```
Simple USD currency formatting with error handling.

#### formatPercentage
```typescript
function formatPercentage(percentage: number): string
```
Formats percentage values with 1 decimal place precision.

#### formatCustomDateRange
```typescript
function formatCustomDateRange(startDate: Date, endDate: Date): string
```
Spanish localized date range formatting.

**Example:** `"Del 01 Sep al 15 Sep"`

#### getDayName
```typescript
function getDayName(date: Date): string
```
Returns Spanish day names with proper capitalization.

**Examples:**
- Monday → `"Lunes"`
- Friday → `"Viernes"`

---

## Performance Considerations

### Memoization Strategy

#### CustomSalesComparison
```typescript
// Pre-memoized header
const MemoizedCustomComparisonHeader = React.memo(CustomComparisonHeader);

// Custom comparison for sales card
const MemoizedSalesCustomCard = React.memo(SalesCustomCard, (prevProps, nextProps) => {
  // Custom deep comparison for data arrays
  return (
    prevProps.data.length === nextProps.data.length &&
    prevProps.data.every((item, index) => {
      const nextItem = nextProps.data[index];
      return nextItem && 
        item.date.getTime() === nextItem.date.getTime() &&
        item.amount === nextItem.amount &&
        item.isInRange === nextItem.isInRange;
    }) &&
    prevProps.dateRange.from?.getTime() === nextProps.dateRange.from?.getTime() &&
    prevProps.dateRange.to?.getTime() === nextProps.dateRange.to?.getTime()
  );
});
```

#### Data Generation Memoization
```typescript
const displayData: SalesCustomData[] = React.useMemo(() => {
  if (salesData && salesData.length > 0) {
    // Validate and use provided data
    return salesData;
  }
  return generateMockCustomSalesData(selectedDateRange!);
}, [selectedDateRange, salesData]);
```

### Performance Best Practices

1. **Conditional Rendering**: Early returns prevent unnecessary computation
2. **Data Validation Caching**: Validation results could be memoized
3. **Large Range Warnings**: Console warnings for ranges >90 days
4. **Tabular Numbers**: CSS `tabular-nums` for consistent number alignment

---

## Error Handling

### Graceful Degradation Strategy

1. **Invalid Data Fallback**: Falls back to mock data if validation fails
2. **Console Logging**: Development warnings without breaking UI
3. **Null Returns**: Prevents rendering broken components
4. **Default Parameters**: Prevents runtime parameter errors
5. **Try-Catch**: Formatting functions include error recovery

### Development Debugging

```typescript
// Example validation logging
if (!displayDataValidation.isValid) {
  console.error('CustomSalesComparison: Display data validation failed:', 
    displayDataValidation.errors);
  return null;
}

// Non-critical warnings
if (displayDataValidation.warnings.length > 0) {
  console.warn('CustomSalesComparison: Data warnings:', 
    displayDataValidation.warnings);
}
```

---

## Integration Examples

### Dashboard Integration
```tsx
function SalesDashboard({ selectedDateRange }: { selectedDateRange: DateRange }) {
  return (
    <div className="space-y-4">
      {/* Other components for day/week/month views */}
      
      {/* Custom range components - conditional rendering */}
      <CustomSalesComparison selectedDateRange={selectedDateRange} />
      <CustomSalesBranches selectedDateRange={selectedDateRange} />
    </div>
  );
}
```

### API Integration
```tsx
function CustomSalesWithAPI({ selectedDateRange }: { selectedDateRange: DateRange }) {
  const { data: salesData } = useQuery({
    queryKey: ['customSales', selectedDateRange],
    queryFn: () => fetchCustomSalesData(selectedDateRange),
    enabled: isCustomRangeSelected(selectedDateRange)
  });
  
  const { data: branchData } = useQuery({
    queryKey: ['customBranches', selectedDateRange],
    queryFn: () => fetchCustomBranchData(selectedDateRange),
    enabled: isCustomRangeSelected(selectedDateRange)
  });
  
  return (
    <>
      <CustomSalesComparison 
        selectedDateRange={selectedDateRange}
        salesData={salesData}
      />
      <CustomSalesBranches 
        selectedDateRange={selectedDateRange}
        branches={branchData}
      />
    </>
  );
}
```