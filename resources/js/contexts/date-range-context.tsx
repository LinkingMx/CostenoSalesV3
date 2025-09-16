import { type DateRange } from '@/components/main-filter-calendar';
import { createContext, ReactNode, useContext } from 'react';

/**
 * Context for sharing date range across components
 */
interface DateRangeContextValue {
    dateRange: DateRange | undefined;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

/**
 * Provider component for date range context
 */
export interface DateRangeProviderProps {
    children: ReactNode;
    dateRange: DateRange | undefined;
}

export function DateRangeProvider({ children, dateRange }: DateRangeProviderProps) {
    const value: DateRangeContextValue = {
        dateRange,
    };

    return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
}

/**
 * Hook to access date range from context
 */
export function useDateRange() {
    const context = useContext(DateRangeContext);

    if (!context) {
        if (process.env.NODE_ENV === 'development') {
            console.error('useDateRange must be used within a DateRangeProvider. Returning empty context.');
        }
        // Return a safe default instead of throwing in production
        return { dateRange: undefined };
    }

    return context;
}
