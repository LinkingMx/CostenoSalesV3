# MainFilterCalendar Component Documentation

## Overview

The `MainFilterCalendar` is a comprehensive date range selector component built for the CostenoSalesV3 Laravel React application. It provides a Spanish-localized interface for selecting date ranges with both quick period selection and manual calendar-based selection.

## Features

- **Spanish Localization**: All text, months, and days are in Spanish
- **Quick Period Selection**: Predefined periods organized in groups (Daily, Weekly, Monthly)
- **Manual Date Selection**: Interactive calendar for custom date range selection  
- **Auto-initialization**: Defaults to today's date on component mount
- **Responsive Design**: Adapts to different screen sizes with proper spacing
- **Integrated Refresh**: Built-in refresh button for page/data updates

## Architecture

### Component Structure

```
main-filter-calendar/
├── index.ts                    # Main export file
├── main-filter-calendar.tsx    # Core component
├── types.ts                    # TypeScript interfaces
├── utils.ts                    # Date utilities and constants
├── hooks/
│   └── use-date-range.ts       # Date range state management hook
└── components/
    ├── period-selector.tsx     # Quick period selection dropdown
    ├── calendar-view.tsx       # Interactive calendar component
    └── refresh-button.tsx      # Page refresh functionality
```

### Key Design Decisions

1. **Modular Architecture**: Each functionality is separated into focused components
2. **Composition over Inheritance**: Uses shadcn/ui base components without modification
3. **Custom Hook**: Centralizes date range state management logic
4. **Spanish Constants**: All localization data is centralized in utils
5. **Type Safety**: Full TypeScript coverage with strict typing

## Usage

### Basic Implementation

```tsx
import { MainFilterCalendar, type DateRange } from '@/components/main-filter-calendar';
import { useState } from 'react';

export default function MyPage() {
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const handleDateChange = (range: DateRange | undefined) => {
        setSelectedDateRange(range);
        // Handle date range change
    };

    return (
        <MainFilterCalendar 
            value={selectedDateRange} 
            onChange={handleDateChange}
        />
    );
}
```

### Props Interface

```tsx
interface MainFilterCalendarProps {
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
    placeholder?: string;
    onRefresh?: () => void;
}

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}
```

## Component Details

### MainFilterCalendar (Core Component)

**Location**: `main-filter-calendar.tsx`

**Key Features**:
- Auto-initializes with today's date if no value provided
- Manages popover state for calendar display
- Coordinates between period selection and manual selection
- Provides Apply/Cancel actions for date range confirmation

**Styling**:
- Height: `h-9` for consistent form element sizing
- Padding: `px-3 py-1` for compact spacing
- Gap: `gap-2` between datepicker and refresh button
- Gray color scheme throughout

### PeriodSelector

**Location**: `components/period-selector.tsx`

**Features**:
- Grouped period options (Daily, Weekly, Monthly)
- Custom date option at the top
- No scroll design with compact spacing
- Gray icons and consistent styling

**Period Groups**:
- **Diarios**: Hoy, Ayer, Últimos 7 días, Últimos 30 días
- **Semanales**: Esta semana, Semana pasada, Últimas 4 semanas
- **Mensuales**: Este mes, Mes pasado, Últimos 3 meses, Últimos 6 meses, Últimos 12 meses

### CalendarView

**Location**: `components/calendar-view.tsx`

**Features**:
- Interactive month navigation
- Spanish day/month labels
- Visual range selection feedback
- Today highlighting
- Gray color scheme for selections

**Visual States**:
- Today: Dark background when not selected, ring when selected
- Range start/end: Gray background with white text
- In-range dates: Light gray background
- Pending selection: Ring indicator for first date selection

### RefreshButton

**Location**: `components/refresh-button.tsx`

**Features**:
- Square button design (`h-9 w-9`)
- Page reload functionality as default
- Customizable refresh action via props
- Consistent styling with main component

### useDateRange Hook

**Location**: `hooks/use-date-range.ts`

**Purpose**: Centralizes all date range state management logic

**Managed State**:
- Temporary range during selection
- Selected period type
- Calendar navigation (month/year)
- Selection interaction handlers

## Styling Guide

### Color Scheme
- **Primary**: Gray variants (`gray-50`, `gray-100`, `gray-600`, `gray-900`)
- **Backgrounds**: White with gray accents
- **Borders**: Light gray (`border-gray-200`, `border-gray-300`)
- **Text**: Dark gray for readability (`text-gray-700`, `text-gray-900`)

### Spacing
- **Component height**: `h-9` (36px) for form consistency
- **Internal padding**: `px-3 py-1` for compact feel
- **Gap between elements**: `gap-2` (8px)
- **Calendar day buttons**: `h-9 w-9` for touch-friendly interaction

### Responsiveness
- Popover width matches trigger width using CSS variables
- Calendar grid adapts to content
- Touch-friendly button sizes on mobile

## Localization

### Spanish Constants

**Months**: Enero, Febrero, Marzo, Abril, Mayo, Junio, Julio, Agosto, Septiembre, Octubre, Noviembre, Diciembre

**Days**: Dom, Lun, Mar, Mié, Jue, Vie, Sáb

**UI Text**:
- "Selección de período rápido" - Quick period selection
- "Fechas personalizadas" - Custom dates
- "Seleccionar fechas" - Select dates placeholder
- "Cancelar" / "Aplicar" - Cancel / Apply buttons

### Date Formatting

Uses Spanish locale formatting with `formatDateRange` utility:
- Single date: "15 de enero de 2024"
- Date range: "15 de enero de 2024 - 20 de enero de 2024"

## State Management

### Default Behavior
1. Component initializes with today's date
2. On popover open, syncs temporary state with current value
3. Period selection updates both temporary range and period type
4. Manual calendar selection updates temporary range and resets period to custom
5. Apply button confirms temporary state as final value
6. Cancel button reverts to last confirmed state

### Date Range Selection Logic
- First click sets start date (pending state)
- Second click sets end date (completes range)
- Clicking on existing range boundaries allows reshaping
- Visual feedback shows pending, selected, and in-range states

## Integration Notes

### Requirements
- React 19+ with hooks support
- shadcn/ui components (Select, Button, Popover, Calendar icon from lucide-react)
- TailwindCSS v4 for styling
- TypeScript for type safety

### Performance Considerations
- Uses React.useMemo for expensive date calculations
- Optimized re-renders with proper dependency arrays
- Efficient calendar grid generation with key optimization

### Accessibility
- Keyboard navigation support through shadcn/ui components
- ARIA labels and semantic HTML structure
- Focus management in popover interactions
- Screen reader friendly date announcements

## Troubleshooting

### Common Issues

**Scroll appearing in period selector**:
- Ensure compact padding (`py-1.5` not `py-2.5`)
- Check SelectContent width constraints
- Verify no max-height restrictions

**Blue colors instead of gray**:
- Check all className props use gray variants
- Verify icon colors are set to `text-gray-600`
- Ensure selection states use gray backgrounds

**Component height too tall**:
- Maintain `h-9` height for form consistency
- Use compact padding (`py-1` not `py-2`)
- Check gap spacing between elements

### Debugging Tips

1. **Console logging**: Date changes are logged in dashboard implementation
2. **State inspection**: Use React DevTools to inspect hook state
3. **Visual debugging**: Add temporary borders to identify spacing issues
4. **Type checking**: Run `npm run types` to catch TypeScript issues

## Future Enhancements

### Potential Improvements
- Time selection support for datetime ranges
- Preset range templates (quarters, fiscal years)
- Multiple date range selection
- Integration with backend date filtering
- Keyboard shortcuts for common periods
- Export/import of date range preferences

### Maintenance Notes
- Keep Spanish translations updated
- Monitor shadcn/ui component updates for breaking changes
- Review TailwindCSS class usage when upgrading versions
- Test across different browsers and devices
- Validate accessibility compliance regularly