# Custom Sales Components - Architecture Overview

## Executive Summary

This document provides a comprehensive overview of the custom sales components designed for CostenoSalesV3. The components handle the display of sales analytics data for custom date ranges that do not fall into standard patterns (single day, complete week, or complete month).

## Component Architecture

### Core Components

1. **CustomSalesComparison** (`custom-sales-comparison/`)
   - Main aggregated sales view for custom ranges
   - Shows total and average sales with date range context
   - Single card display with performance metrics

2. **CustomSalesBranches** (`custom-sales-branches/`)
   - Detailed branch-by-branch sales breakdown
   - Collapsible cards showing metrics per branch location
   - Supports open/closed accounts and ticket analysis

### Key Design Principles

- **Conditional Rendering**: Only displays when `isCustomRangeSelected()` returns true
- **Spanish Localization**: All UI text in Spanish for Mexican market
- **Performance Optimized**: Memoized components with custom comparison functions
- **Type Safety**: Comprehensive TypeScript interfaces throughout
- **Accessibility**: ARIA labels and semantic HTML structure
- **Responsive Design**: Mobile-first approach with clean layouts

## Data Flow Architecture

```mermaid
graph TD
    A[Date Filter Calendar] --> B[isCustomRangeSelected()]
    B --> C{Is Custom Range?}
    C -->|Yes| D[CustomSalesComparison]
    C -->|Yes| E[CustomSalesBranches]
    C -->|No| F[Components Return null]
    
    D --> G[generateMockCustomSalesData]
    E --> H[DUMMY_CUSTOM_BRANCHES_DATA]
    
    G --> I[SalesCustomCard]
    H --> J[BranchCustomCollapsibleItem]
```

## Component Relationships

### CustomSalesComparison Structure
```
CustomSalesComparison
├── CustomComparisonHeader (memoized)
├── SalesCustomCard (memoized with custom comparison)
├── Validation Layer (validateCustomSalesData)
└── Data Generation (generateMockCustomSalesData)
```

### CustomSalesBranches Structure
```
CustomSalesBranches
├── CustomSalesBranchesHeader
├── BranchCustomCollapsibleItem[]
│   ├── Collapsible Trigger (branch summary)
│   └── CollapsibleContent (detailed metrics)
├── Branch Validation
└── Mock Data (DUMMY_CUSTOM_BRANCHES_DATA)
```

## Key Features

### Performance Optimizations
- **React.memo** usage on header and card components
- **Custom comparison functions** for memoized sales cards
- **useMemo** for expensive data calculations
- **Conditional rendering** to prevent unnecessary renders

### Validation System
- **Runtime validation** with detailed error reporting
- **Data integrity checks** for business logic consistency
- **Range validation** (2-365 days, proper date objects)
- **Development warnings** for data quality issues

### Internationalization
- **Spanish localization** throughout UI
- **Mexican peso formatting** with proper locale
- **Spanish date formats** ("Del 01 Sep al 15 Sep")
- **Spanish day names** ("Lunes", "Martes", etc.)

## Business Logic

### Custom Range Detection
A range is considered "custom" when it does NOT match:
- Single day (from === to)
- Complete week (Monday-Sunday, 7 days)
- Complete month (1st to last day of month)

### Mock Data Generation
- **Realistic business patterns**: Higher sales Wed-Fri, lower on weekends
- **Seasonal variations**: Holiday and seasonal factor support
- **Random variations**: ±15% variation for realistic data patterns
- **Base amounts**: ~850,000 MXN daily baseline for Mexican market

## Error Handling

### Validation Results
All validation functions return `ValidationResult` interface:
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];         // Critical issues preventing display
  warnings: string[];       // Non-critical issues logged to console
  metadata: object;         // Debug information and context
}
```

### Graceful Degradation
- Invalid data falls back to mock data generation
- Console warnings for development debugging
- Null returns prevent broken UI display
- Default parameters prevent runtime errors

## File Organization

```
custom-sales-comparison/
├── components/
│   ├── custom-comparison-header.tsx
│   ├── sales-custom-card.tsx
│   └── index.ts
├── utils/
│   ├── validation.ts
│   ├── data-generation.ts
│   └── formatting.ts
├── types/
│   └── index.ts
├── custom-sales-comparison.tsx
└── index.ts

custom-sales-branches/
├── components/
│   ├── custom-sales-branches-header.tsx
│   ├── branch-custom-collapsible-item.tsx
│   └── index.ts
├── types/
│   └── index.ts (duplicate)
├── types.ts
├── utils/
│   └── validation.ts
├── utils.ts
├── custom-sales-branches.tsx
└── index.ts
```

## Integration Points

### External Dependencies
- `@/components/main-filter-calendar` - DateRange type
- `@/lib/date-validation` - isCustomRangeSelected function
- `@/components/ui/*` - shadcn/ui components
- `lucide-react` - Icon components

### State Management
- Components are stateless except for collapsible open/closed state
- Data flows down from parent dashboard components
- No global state management required

## Future Considerations

### Extensibility Points
1. **Currency Support**: Already configured for MXN/USD/COP
2. **Data Sources**: Ready for real API data replacement
3. **Seasonal Factors**: Built-in seasonal variation support
4. **Validation Rules**: Configurable business logic validation
5. **Localization**: Framework ready for additional language support

### Performance Monitoring
- Large range warnings (>90 days)
- Data validation metrics tracking
- Console logging for development insights
- Memory usage considerations for large datasets

## Version Information

- **Created**: 2025-09-12
- **Components Version**: Initial implementation
- **TypeScript**: Strict mode enabled
- **React**: 19.x with automatic JSX runtime
- **Target Market**: Mexican retail/sales industry