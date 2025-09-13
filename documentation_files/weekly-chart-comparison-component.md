# WeeklyChartComparison Component Documentation

## Overview

The `WeeklyChartComparison` component is a sophisticated chart visualization system designed specifically for CostenoSalesV3, providing interactive 3-week sales comparison data through an elegant line chart interface. Built with performance, accessibility, and user experience as core priorities.

## 🎯 Purpose & Context

This component serves as the primary visualization tool for comparing daily sales performance across three weeks, enabling business analysts and stakeholders to identify patterns, trends, and anomalies in sales data. It's specifically designed for the Mexican market with proper Spanish localization and peso currency formatting.

## 📍 Location & Integration

**File Path**: `resources/js/components/weekly-chart-comparison/`
**Dashboard Position**: Positioned below the `weekly-sales-comparison` component
**Conditional Display**: Only renders when exactly one complete week (7 consecutive days) is selected

## 🏗️ Architecture & File Structure

```
weekly-chart-comparison/
├── weekly-chart-comparison.tsx           # Main container component (195 lines)
├── types.ts                              # TypeScript interfaces and type definitions
├── utils.ts                              # Data generation, validation, and utility functions (412 lines)
├── index.ts                              # Export configuration for clean imports
└── components/
    ├── weekly-chart-header.tsx           # Header component with icon, title, and subtitle
    └── weekly-comparison-chart.tsx       # Core Recharts implementation (239 lines)
```

## 🔧 Technical Implementation

### Core Technologies
- **Chart Library**: Recharts 2.x for React + TypeScript compatibility
- **Styling**: TailwindCSS v4 with theme variable integration
- **Performance**: React.memo with custom deep comparison logic
- **Validation**: Comprehensive runtime validation with development logging
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels

### Chart Configuration
```typescript
// Chart dimensions and styling
const chartConfig = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  strokeWidth: 2,
  dotSize: 4,
  activeDotSize: 6,
  height: 300
};

// Theme integration
const theme = {
  primaryColor: '#897053',
  weekColors: ['#897053', '#6b5d4a', '#4a3d2f'],
  gridColor: isDarkMode ? '#3F3F3F' : '#D1D5DB',
  textColor: isDarkMode ? '#E0E0E0' : '#5A5A5A'
};
```

## 📊 Data Structure & Types

### Core Interfaces

```typescript
interface WeeklyChartData {
  dailyData: ChartDayData[];        // Array of 7 days of sales data
  weekLabels: string[];             // ['Semana 1', 'Semana 2', 'Semana 3']
  weekColors: string[];             // Color coding for each week line
}

interface ChartDayData {
  dayName: string;                  // Short day name (LUN, MAR, MIÉ, etc.)
  fullDayName: string;              // Full day name (Lunes, Martes, etc.)
  week1: number;                    // Sales amount for week 1
  week2: number;                    // Sales amount for week 2  
  week3: number;                    // Sales amount for week 3
}

interface WeeklyChartComparisonProps {
  selectedDateRange?: DateRange;    // Date range from calendar filter
  chartData?: WeeklyChartData;      // Optional real data (defaults to mock)
}
```

### Mock Data Generation

The component includes sophisticated mock data generation that follows realistic Mexican business patterns:

```typescript
// Business pattern factors by day of week
const dayFactors = {
  Monday: 0.85,     // Slower start (post-weekend)
  Tuesday: 1.1,     // Business normalizes
  Wednesday: 1.2,   // Peak mid-week performance
  Thursday: 1.15,   // Strong pre-weekend activity
  Friday: 1.3,      // Highest (paydays, weekend prep)
  Saturday: 1.1,    // Weekend shopping
  Sunday: 0.7       // Lowest activity day
};

// Week-to-week variations
const weekFactors = [1.0, 0.95, 1.08]; // Baseline, -5%, +8%
```

## 🎨 Visual Design Specifications

### Chart Elements
- **Chart Type**: Multi-line chart with 3 colored lines
- **X-Axis**: Spanish day abbreviations (LUN, MAR, MIÉ, JUE, VIE, SÁB, DOM)
- **Y-Axis**: Hidden for clean appearance, values displayed in tooltips
- **Grid**: Horizontal grid lines only, theme-adaptive opacity
- **Legend**: Week labels with color-coded indicators

### Color Scheme
```css
/* Primary week line */
--week-1-color: #897053;

/* Secondary week lines */
--week-2-color: #6b5d4a;
--week-3-color: #4a3d2f;

/* Interactive states */
--hover-dot-size: 6px;
--active-dot-border: 2px;
```

### Typography & Spacing
- **Day Labels**: Font weight 600, size 13px, uppercase
- **Tooltip Text**: Font size 12-14px with proper hierarchy
- **Chart Height**: 300px default, responsive scaling
- **Margins**: Optimized for readability and mobile compatibility

## 🖱️ User Interactions

### Hover States
- **Dot Highlighting**: Active dots increase in size with border outline
- **Tooltip Display**: Custom-styled popup with day name and formatted amounts
- **Line Emphasis**: No cursor line for clean visual experience

### Tooltip Configuration
```typescript
const CustomTooltip = ({ active, payload, label }) => (
  <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
    <p className="text-sm font-semibold text-foreground mb-3 border-b border-border pb-2">
      {fullDayName} {/* Lunes, Martes, etc. */}
    </p>
    <div className="space-y-1">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-medium text-foreground">{entry.name}</span>
          </div>
          <span className="text-sm font-bold text-primary">
            {formatChartAmount(entry.value)}
          </span>
        </div>
      ))}
    </div>
  </div>
);
```

## 🌐 Internationalization & Localization

### Spanish Language Support
```typescript
// Day name mappings
const spanishDayNames = {
  short: ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'],
  full: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
};

// Currency formatting
const formatChartAmount = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('MXN', '$').trim();
};
```

## 🚀 Performance Optimizations

### Memoization Strategy
```typescript
// Deep comparison memoization for chart data
const MemoizedWeeklyComparisonChart = React.memo(WeeklyComparisonChart, (prevProps, nextProps) => {
  // Custom comparison logic for chart data
  if (prevProps.height !== nextProps.height || 
      prevProps.showLegend !== nextProps.showLegend) {
    return false; // Re-render needed
  }
  
  // Deep comparison of daily data arrays
  const prevData = prevProps.data;
  const nextData = nextProps.data;
  
  if (prevData.dailyData.length !== nextData.dailyData.length) return false;
  
  for (let i = 0; i < prevData.dailyData.length; i++) {
    const prevDay = prevData.dailyData[i];
    const nextDay = nextData.dailyData[i];
    
    if (prevDay.week1 !== nextDay.week1 || 
        prevDay.week2 !== nextDay.week2 || 
        prevDay.week3 !== nextDay.week3) {
      return false;
    }
  }
  
  return true; // No changes detected
});
```

### Lazy Rendering
- **Conditional Display**: Component only mounts when complete week is selected
- **Data Validation**: Skipped in production for performance
- **Memoized Calculations**: Date range validation and data generation cached

## ✅ Validation & Error Handling

### Comprehensive Data Validation
```typescript
const validateWeeklyChartData = (chartData: WeeklyChartData): ChartValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate dailyData array (must be exactly 7 days)
  if (!chartData.dailyData || chartData.dailyData.length !== 7) {
    errors.push(`Daily data should contain exactly 7 days`);
  }
  
  // Validate each day's sales amounts
  chartData.dailyData.forEach((dayData, index) => {
    ['week1', 'week2', 'week3'].forEach((weekKey) => {
      const amount = dayData[weekKey];
      
      if (typeof amount !== 'number' || isNaN(amount)) {
        errors.push(`Day ${index + 1}, ${weekKey}: amount must be a valid number`);
      } else if (amount < 0) {
        errors.push(`Day ${index + 1}, ${weekKey}: amount cannot be negative`);
      } else if (amount > 100000000) {
        warnings.push(`Day ${index + 1}, ${weekKey}: amount seems unusually high`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      validatedAt: new Date(),
      source: 'weekly-chart-data-validation',
      dayCount: chartData.dailyData?.length || 0
    }
  };
};
```

### Development Mode Features
- **Console Logging**: Detailed validation results and warnings
- **Runtime Checks**: Data integrity verification on every render
- **Error Boundaries**: Graceful failure handling with fallback UI

## 🎨 Theme Integration

### CSS Variables Integration
```css
/* Theme-aware styling */
.weekly-chart-container {
  background-color: var(--card);
  border: 1px solid var(--border);
  color: var(--foreground);
}

/* Dynamic theme detection */
const isDarkMode = document.documentElement.classList.contains('dark');
const gridColor = isDarkMode ? '#3F3F3F' : '#D1D5DB';
const textColor = isDarkMode ? '#E0E0E0' : '#5A5A5A';
```

### Focus Management
```typescript
// Remove unwanted focus outlines while maintaining accessibility
<div 
  className="w-full focus:outline-none focus:ring-0 [&_svg]:focus:outline-none [&_*]:outline-none"
  style={{ outline: 'none' }}
  tabIndex={-1}
  role="img"
  aria-label="Gráfico de comparación semanal de ventas"
>
```

## 📱 Responsive Design

### Breakpoint Considerations
- **Mobile (< 768px)**: Optimized touch targets, readable text sizes
- **Tablet (768px - 1024px)**: Balanced layout with proper spacing
- **Desktop (> 1024px)**: Full feature set with enhanced interactions

### Chart Scaling
```typescript
<ResponsiveContainer width="100%" height={height}>
  <LineChart
    data={data.dailyData}
    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  >
    {/* Chart implementation */}
  </LineChart>
</ResponsiveContainer>
```

## 🔍 Testing & Quality Assurance

### Development Validation
- **Type Safety**: Comprehensive TypeScript interfaces with strict checking
- **Runtime Validation**: Data integrity checks with detailed error reporting
- **Component Testing**: React.memo performance verification
- **Accessibility Testing**: ARIA label verification and keyboard navigation

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **SVG Support**: Recharts requires modern SVG implementations
- **CSS Variables**: Full support for CSS custom properties

## 🚀 Usage Examples

### Basic Implementation
```tsx
import { WeeklyChartComparison } from '@/components/weekly-chart-comparison';

// In dashboard component
<WeeklyChartComparison 
  selectedDateRange={dateRange}
/>
```

### With Custom Data
```tsx
const customChartData: WeeklyChartData = {
  dailyData: [
    {
      dayName: 'LUN',
      fullDayName: 'Lunes',
      week1: 120000,
      week2: 115000,
      week3: 138000
    },
    // ... 6 more days
  ],
  weekLabels: ['Semana Actual', 'Semana Anterior', 'Hace 2 Semanas'],
  weekColors: ['#897053', '#6b5d4a', '#4a3d2f']
};

<WeeklyChartComparison 
  selectedDateRange={dateRange}
  chartData={customChartData}
/>
```

## 🔧 Configuration Options

### Chart Customization
```typescript
interface WeeklyComparisonChartProps {
  data: WeeklyChartData;
  height?: number;              // Default: 300px
  showLegend?: boolean;         // Default: true
  showGrid?: boolean;           // Default: true
}
```

### Theme Customization
```css
/* Override default colors */
:root {
  --chart-primary: #897053;
  --chart-secondary: #6b5d4a;
  --chart-tertiary: #4a3d2f;
  --chart-grid: #D1D5DB;
}

.dark {
  --chart-grid: #3F3F3F;
}
```

## 📈 Future Enhancements

### Planned Features
1. **Export Functionality**: PNG/SVG chart export capabilities
2. **Animation States**: Smooth transitions when data updates
3. **Zoom Interactions**: Time period zoom and pan functionality
4. **Comparative Metrics**: Week-over-week percentage change indicators
5. **Real-time Updates**: WebSocket integration for live data updates

### Performance Improvements
1. **Virtual Scrolling**: For handling larger datasets
2. **WebGL Rendering**: For complex visualizations with many data points
3. **Lazy Loading**: Deferred chart rendering for off-screen components

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Fixed Week Count**: Hardcoded to 3 weeks (design constraint)
2. **Mock Data Only**: Requires backend integration for real data
3. **Desktop Optimized**: Mobile experience could be enhanced
4. **Static Time Periods**: No dynamic time range selection within chart

### Browser Considerations
- **Safari iOS**: Occasional SVG rendering delays on older devices
- **IE11**: Not supported (by design, modern browsers only)
- **Firefox**: Minor font rendering differences in tooltips

## 📚 Related Documentation

- [MainFilterCalendar Component](../CLAUDE.md#mainFilterCalendar-component)
- [Theme System Documentation](../CLAUDE.md#theme-system)
- [Sales Components Architecture](./custom-sales-components-overview.md)
- [PWA Implementation Guide](../PWA_IMPLEMENTATION.md)

---

**Last Updated**: December 2024  
**Component Version**: 1.0.0  
**Maintainer**: CostenoSalesV3 Development Team