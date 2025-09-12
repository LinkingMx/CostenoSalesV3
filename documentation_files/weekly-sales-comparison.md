# Weekly Sales Comparison Component

## Overview

The Weekly Sales Comparison component is a sophisticated React component designed for displaying and comparing weekly sales data in the CostenoSalesV3 application. It provides an intuitive interface for viewing daily sales performance within a selected work week (Monday through Friday), with special highlighting for the current week.

## Purpose

This component serves as a focused view for weekly sales analysis, allowing users to:
- Compare daily sales performance within a work week
- Identify current week trends with visual highlighting
- Analyze business patterns across weekdays
- Track sales performance with Mexican peso formatting

## Architecture Overview

The component follows a modular architecture with clear separation of concerns:

```
weekly-sales-comparison/
├── index.ts                           # Barrel exports
├── types.ts                          # TypeScript interfaces
├── utils.ts                          # Business logic & utilities
├── weekly-sales-comparison.tsx       # Main component
└── components/
    ├── sales-week-card.tsx          # Individual day card
    └── weekly-comparison-header.tsx  # Header section
```

### Design Patterns

- **Container/Presenter Pattern**: Main component handles logic, sub-components handle presentation
- **Conditional Rendering**: Only displays when work week criteria are met
- **Data Validation**: Comprehensive runtime validation with graceful degradation
- **Responsive Design**: Adapts to different screen sizes and contexts

## File Structure Detail

### 1. `index.ts` - Barrel Export Module
**Purpose**: Centralized export point for the entire component module
**Exports**: Main component, sub-components, types, and utility functions

### 2. `types.ts` - Type Definitions
**Purpose**: Comprehensive TypeScript interfaces and type definitions
**Key Interfaces**:
- `SalesWeekData`: Individual day sales information
- `WeeklySalesComparisonProps`: Main component configuration
- `ValidationResult`: Runtime validation feedback
- `SalesWeekCardProps`: Day card configuration
- `WeeklyComparisonHeaderProps`: Header configuration

### 3. `utils.ts` - Business Logic & Utilities
**Purpose**: Core business logic, validation, and utility functions
**Key Functions**:
- `isWorkWeekSelected()`: Work week validation logic
- `generateWeekdays()`: Date range processing
- `formatSalesAmount()`: Currency formatting for Mexican pesos
- `generateMockWeeklySalesData()`: Development mock data
- `validateWeeklySalesData()`: Runtime data validation

### 4. `weekly-sales-comparison.tsx` - Main Component
**Purpose**: Primary component orchestrating the weekly sales display
**Features**:
- Conditional rendering based on date selection
- Data validation and error handling
- Mock data generation for development
- Responsive layout management

### 5. `components/sales-week-card.tsx` - Day Card Component
**Purpose**: Individual day sales display card
**Features**:
- Circular day indicator with Spanish day letters
- Formatted date and currency display
- Current week highlighting
- Accessibility-compliant structure

### 6. `components/weekly-comparison-header.tsx` - Header Component
**Purpose**: Section header with title and description
**Features**:
- Calendar icon with semantic meaning
- Customizable title and subtitle
- Consistent typography and spacing

## API Documentation

### Main Component Props

```typescript
interface WeeklySalesComparisonProps {
  selectedDateRange: DateRange | undefined;  // Required: Date range from calendar filter
  salesData?: SalesWeekData[];              // Optional: Custom sales data array
}
```

### SalesWeekData Interface

```typescript
interface SalesWeekData {
  date: Date;              // The date for this sales record
  amount: number;          // Sales amount in Mexican pesos
  isCurrentWeek: boolean;  // Whether this date is within current week
  dayName: string;         // Spanish day name (e.g., "Lunes", "Martes")
}
```

### ValidationResult Interface

```typescript
interface ValidationResult {
  isValid: boolean;        // Whether data passed all validation checks
  errors: string[];        // Array of validation error messages
  warnings: string[];      // Array of non-critical warnings
  metadata: {              // Additional validation context
    validatedAt: Date;
    source: string;
    itemCount?: number;
  };
}
```

## Usage Examples

### Basic Implementation

```tsx
import { WeeklySalesComparison } from '@/components/weekly-sales-comparison';
import type { DateRange } from '@/components/main-filter-calendar';

function DashboardPage() {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>();

  return (
    <div className="space-y-6">
      {/* Calendar Filter Component */}
      <MainFilterCalendar 
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
      />
      
      {/* Weekly Sales Component - Renders only for work weeks */}
      <WeeklySalesComparison 
        selectedDateRange={selectedDateRange}
      />
    </div>
  );
}
```

### With Custom Sales Data

```tsx
import { WeeklySalesComparison } from '@/components/weekly-sales-comparison';
import type { SalesWeekData } from '@/components/weekly-sales-comparison';

function CustomDashboard() {
  const customSalesData: SalesWeekData[] = [
    {
      date: new Date('2025-09-15'), // Monday
      amount: 12500000,
      isCurrentWeek: true,
      dayName: 'Lunes'
    },
    {
      date: new Date('2025-09-16'), // Tuesday
      amount: 15750000,
      isCurrentWeek: true,
      dayName: 'Martes'
    },
    // ... remaining weekdays
  ];

  return (
    <WeeklySalesComparison 
      selectedDateRange={workWeekRange}
      salesData={customSalesData}
    />
  );
}
```

### Integration with Data Fetching

```tsx
import { useQuery } from '@tanstack/react-query';
import { WeeklySalesComparison } from '@/components/weekly-sales-comparison';

function DataDrivenDashboard() {
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['weekly-sales', selectedDateRange],
    queryFn: () => fetchWeeklySalesData(selectedDateRange),
    enabled: !!selectedDateRange,
  });

  if (isLoading) return <WeeklySalesLoadingSkeleton />;
  if (error) return <WeeklySalesErrorState error={error} />;

  return (
    <WeeklySalesComparison 
      selectedDateRange={selectedDateRange}
      salesData={salesData}
    />
  );
}
```

## Implementation Details

### Work Week Detection Logic

The `isWorkWeekSelected()` function implements sophisticated logic to detect valid work weeks:

```typescript
// Case 1: Exact work week (Monday to Friday)
if (fromDay === 1 && toDay === 5 && daysDiff === 4) {
  return true;
}

// Case 2: Full week containing work week (Sunday-Saturday)
if (daysDiff >= 6) {
  // Search for complete Monday-Friday sequence within range
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 1) { // Found Monday
      const friday = new Date(date);
      friday.setDate(date.getDate() + 4);
      if (friday <= endDate) {
        return true; // Complete work week found
      }
    }
  }
}
```

### Weekday Generation Algorithm

The `generateWeekdays()` function extracts Monday-Friday from any date range:

```typescript
export function generateWeekdays(startDate: Date): Date[] {
  const weekdays: Date[] = [];
  let mondayDate: Date;
  
  if (startDate.getDay() === 1) {
    mondayDate = new Date(startDate);
  } else {
    mondayDate = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    
    if (dayOfWeek === 0) { // Sunday
      mondayDate.setDate(startDate.getDate() + 1);
    } else { // Tuesday through Saturday
      mondayDate.setDate(startDate.getDate() - (dayOfWeek - 1));
    }
  }
  
  // Generate Monday through Friday
  for (let i = 0; i < 5; i++) {
    const day = new Date(mondayDate);
    day.setDate(mondayDate.getDate() + i);
    weekdays.push(day);
  }
  
  return weekdays;
}
```

### Currency Formatting System

The component uses a configurable currency formatting system optimized for Mexican pesos:

```typescript
export function formatSalesAmount(
  amount: number, 
  currency: 'MXN' | 'USD' | 'COP' = 'MXN'
): string {
  const currencyConfig = {
    MXN: { locale: 'es-MX', symbol: '$' },
    USD: { locale: 'en-US', symbol: '$' },
    COP: { locale: 'es-CO', symbol: '$' }
  };
  
  const config = currencyConfig[currency];
  
  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return formatted.replace(currency, config.symbol).trim();
}
```

### Mock Data Generation with Business Patterns

The mock data generation includes realistic weekly business patterns:

```typescript
function generateRealisticWeeklySalesAmount(date: Date): number {
  const baseAmount = 15000000; // Base $15M MXN for weekdays
  const dayOfWeek = date.getDay();
  
  let dayFactor = 1;
  switch (dayOfWeek) {
    case 1: dayFactor = 0.85; break;  // Monday - slower start
    case 2: dayFactor = 1.1; break;   // Tuesday - pickup
    case 3: dayFactor = 1.2; break;   // Wednesday - peak
    case 4: dayFactor = 1.15; break;  // Thursday - strong
    case 5: dayFactor = 1.3; break;   // Friday - end rush
  }
  
  const variation = 0.3; // 30% variation range
  const randomFactor = (Math.random() - 0.5) * 2 * variation + 1;
  
  return Math.round(baseAmount * dayFactor * randomFactor * 100) / 100;
}
```

## Validation System

The component includes comprehensive validation for data integrity:

### Runtime Data Validation

```typescript
export function validateWeeklySalesData(salesData: SalesWeekData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for exactly 5 weekdays
  if (salesData.length !== 5) {
    errors.push(`Weekly sales data should contain exactly 5 days, found ${salesData.length}`);
  }
  
  // Validate each record
  salesData.forEach((item, index) => {
    const dayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][index];
    
    // Date validation
    if (!item.date || !(item.date instanceof Date)) {
      errors.push(`${dayName}: Invalid or missing date`);
    }
    
    // Amount validation
    if (typeof item.amount !== 'number' || isNaN(item.amount)) {
      errors.push(`${dayName}: Amount must be a number`);
    } else if (item.amount < 0) {
      errors.push(`${dayName}: Amount cannot be negative`);
    }
    
    // Weekday sequence validation
    const expectedDay = item.date?.getDay();
    const expectedDayIndex = index + 1;
    if (expectedDay && expectedDay !== expectedDayIndex) {
      errors.push(`${dayName}: Date doesn't match expected weekday position`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: new Date(),
      source: 'weekly-sales-data-validation',
      itemCount: salesData.length
    }
  };
}
```

### Date Range Validation

```typescript
export function validateWeekDateRange(dateRange: DateRange | undefined): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!dateRange) {
    errors.push('Date range is required');
  } else {
    if (!dateRange.from || !dateRange.to) {
      errors.push('Both start and end dates are required');
    }
    
    if (dateRange.from && dateRange.to && !isWorkWeekSelected(dateRange)) {
      errors.push('Date range must contain a complete work week (Monday to Friday)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: new Date(),
      source: 'week-date-range-validation'
    }
  };
}
```

## Technical Decisions and Rationale

### 1. Conditional Rendering Approach

**Decision**: Only render the component when a valid work week is selected
**Rationale**: 
- Prevents confusion with partial week data
- Ensures consistent business logic application
- Improves user experience by showing relevant data only

### 2. Mock Data Generation Strategy

**Decision**: Generate realistic mock data with business patterns
**Rationale**:
- Provides meaningful development experience
- Reflects actual business patterns (Friday peaks, Monday slowdowns)
- Helps with UI testing and validation

### 3. Comprehensive Validation System

**Decision**: Implement both development and production validation
**Rationale**:
- Catches data integrity issues early in development
- Provides graceful degradation in production
- Enables debugging and monitoring

### 4. Spanish Localization

**Decision**: Use Spanish day names and Mexican peso formatting
**Rationale**:
- Matches target market requirements (Mexico)
- Provides culturally appropriate user experience
- Supports business localization needs

### 5. Accessibility-First Design

**Decision**: Implement comprehensive ARIA labels and semantic HTML
**Rationale**:
- Ensures compliance with accessibility standards
- Improves user experience for screen readers
- Supports inclusive design principles

## Performance Considerations

### Advanced Optimization Strategies

1. **Component Memoization**: Pre-memoized sub-components with custom comparison functions
2. **Early Return Pattern**: Work week validation happens before any expensive computations
3. **Stable Dependencies**: Uses `.getTime()` for memoization dependencies instead of object references
4. **Environment-Based Performance**: Development validation vs production performance optimization
5. **Efficient Keys**: Uses timestamp-based keys for optimal React reconciliation
6. **Data Reference Stability**: Memoizes salesData references to prevent unnecessary regeneration

#### Performance Implementation Details

```typescript
// Pre-memoized components prevent unnecessary re-renders
const MemoizedWeeklyComparisonHeader = React.memo(WeeklyComparisonHeader);
const MemoizedSalesWeekCard = React.memo(SalesWeekCard, customComparison);

// Early validation and return for maximum performance
const isValidWorkWeek = React.useMemo(() => 
  isWorkWeekSelected(selectedDateRange), 
  [selectedDateRange]
);

if (!isValidWorkWeek) {
  return null; // Prevent all downstream computations
}

// Stable dependencies for better memoization
const weekdaysToShow = React.useMemo(() => {
  if (!selectedStartDate) return [];
  return generateWeekdays(selectedStartDate);
}, [selectedStartDate?.getTime()]); // Stable numeric dependency
```

### Memory Management

- Date objects are properly handled to prevent memory leaks
- Validation results include cleanup metadata
- Mock data generation uses deterministic patterns

### Bundle Size Impact

- Modular architecture allows for tree-shaking
- Utility functions are pure and easily optimizable
- No heavy dependencies beyond React and utility libraries
- Error boundary adds minimal overhead while providing robust error handling

## Error Handling & Resilience

### WeeklyErrorBoundary Implementation

The component includes a comprehensive error boundary for graceful error handling:

```typescript
import { WeeklyErrorBoundary } from '@/components/weekly-sales-comparison';

// Usage in Dashboard
<WeeklyErrorBoundary>
  <WeeklySalesComparison selectedDateRange={dateRange} />
</WeeklyErrorBoundary>
```

#### Error Boundary Features

1. **Graceful Error Recovery**: Catches JavaScript errors without crashing the entire dashboard
2. **User-Friendly Messages**: Displays localized error messages in Spanish
3. **Retry Functionality**: Allows users to attempt recovery from transient errors
4. **Development Debugging**: Shows detailed error information in development mode
5. **Error Reporting**: Supports custom error handling callbacks for logging/analytics

#### Error UI Example

```typescript
// Default error display
<Card className="border-destructive/50 bg-destructive/5">
  <CardContent className="p-6">
    <div className="flex items-start gap-4">
      <AlertTriangle className="h-6 w-6 text-destructive" />
      <div>
        <h3 className="font-semibold text-destructive">
          Error en Ventas Semanales
        </h3>
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar los datos de ventas semanales.
        </p>
        <Button onClick={handleRetry} variant="outline" size="sm">
          <RefreshCw className="h-3 w-3 mr-1" />
          Reintentar
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

### Error Prevention Strategies

1. **Runtime Validation**: Comprehensive data validation prevents downstream errors
2. **Type Safety**: TypeScript interfaces catch errors at compile time
3. **Defensive Programming**: Null checks and fallback values throughout
4. **Environment Adaptation**: Different error handling for development vs production

## Testing Strategy

### Unit Testing Recommendations

```typescript
describe('WeeklySalesComparison', () => {
  describe('isWorkWeekSelected', () => {
    it('should return true for exact work week (Monday-Friday)', () => {
      const monday = new Date('2025-09-15'); // Monday
      const friday = new Date('2025-09-19'); // Friday
      expect(isWorkWeekSelected({ from: monday, to: friday })).toBe(true);
    });
    
    it('should return true for full week containing work week', () => {
      const sunday = new Date('2025-09-14'); // Sunday
      const saturday = new Date('2025-09-20'); // Saturday
      expect(isWorkWeekSelected({ from: sunday, to: saturday })).toBe(true);
    });
    
    it('should return false for partial work week', () => {
      const tuesday = new Date('2025-09-16'); // Tuesday
      const friday = new Date('2025-09-19'); // Friday
      expect(isWorkWeekSelected({ from: tuesday, to: friday })).toBe(false);
    });
  });
  
  describe('validateWeeklySalesData', () => {
    it('should validate correct weekly sales data', () => {
      const validData = generateMockWeeklySalesData(generateWeekdays(new Date()));
      const result = validateWeeklySalesData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect invalid data structures', () => {
      const invalidData = [{ date: 'invalid', amount: -100 }];
      const result = validateWeeklySalesData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
```

### Integration Testing

```typescript
describe('WeeklySalesComparison Integration', () => {
  it('should render weekly sales cards when work week is selected', () => {
    const workWeekRange = {
      from: new Date('2025-09-15'), // Monday
      to: new Date('2025-09-19')    // Friday
    };
    
    render(<WeeklySalesComparison selectedDateRange={workWeekRange} />);
    
    expect(screen.getByText('Ventas semanales')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5); // 5 weekdays
  });
  
  it('should not render when work week is not selected', () => {
    const partialWeekRange = {
      from: new Date('2025-09-16'), // Tuesday
      to: new Date('2025-09-19')    // Friday
    };
    
    render(<WeeklySalesComparison selectedDateRange={partialWeekRange} />);
    
    expect(screen.queryByText('Ventas semanales')).not.toBeInTheDocument();
  });
});
```

## Future Enhancement Opportunities

### Short-term Enhancements

1. **Error Boundary Integration**
   - Add error boundaries for graceful error handling
   - Implement fallback UI for error states

2. **Loading States**
   - Add skeleton loading components
   - Implement loading indicators for data fetching

3. **Animation Enhancements**
   - Add smooth transitions between states
   - Implement hover animations for cards

### Medium-term Enhancements

1. **Comparison Features**
   - Week-over-week comparison
   - Percentage change indicators
   - Trend analysis visualization

2. **Export Functionality**
   - PDF/Excel export of weekly data
   - Shareable weekly reports

3. **Customization Options**
   - Configurable currency formats
   - Alternative date formats
   - Theming support

### Long-term Vision

1. **Advanced Analytics**
   - Predictive analytics for weekly trends
   - Anomaly detection for unusual patterns
   - Business intelligence integration

2. **Real-time Updates**
   - WebSocket integration for live data
   - Real-time notifications for milestones
   - Progressive data loading

3. **Mobile Optimization**
   - Touch-optimized interactions
   - Mobile-specific layouts
   - Offline data caching

## Dependencies

### Core Dependencies
- **React**: Component framework and hooks
- **TypeScript**: Type safety and development experience
- **Lucide React**: Icon library for UI elements

### Internal Dependencies
- **@/components/ui/card**: UI Card components
- **@/lib/utils**: Utility functions (cn for class names)
- **@/components/main-filter-calendar**: Date range picker integration

### Development Dependencies
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## Maintenance Guidelines

### Code Quality Standards

1. **TypeScript Compliance**: All code must be properly typed
2. **Documentation**: JSDoc comments required for all public APIs
3. **Testing**: Unit tests for all utility functions and components
4. **Accessibility**: WCAG 2.1 AA compliance required

### Performance Monitoring

1. **Bundle Size**: Monitor component bundle impact
2. **Render Performance**: Profile component rendering
3. **Memory Usage**: Track memory leaks in development

### Update Strategy

1. **React Updates**: Stay current with React releases
2. **Security Patches**: Regular dependency updates
3. **Feature Releases**: Coordinate with design system updates

---

*This documentation is maintained as part of the CostenoSalesV3 project. For questions or contributions, please refer to the project's contribution guidelines.*