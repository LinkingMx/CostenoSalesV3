import { CustomSalesBranches } from '@/components/custom-sales-branches';
import { CustomSalesComparison } from '@/components/custom-sales-comparison';
import { DailyChartComparison } from '@/components/daily-chart-comparison';
import { DailySalesBranches } from '@/components/daily-sales-branches';
import { DailySalesComparison } from '@/components/daily-sales-comparison';
import { MainFilterCalendar, type DateRange } from '@/components/main-filter-calendar';
import { MonthlyChartComparison } from '@/components/monthly-chart-comparison';
import { MonthlySalesBranches } from '@/components/monthly-sales-branches';
import { MonthlyErrorBoundary, MonthlySalesComparison } from '@/components/monthly-sales-comparison';
import { WeeklyChartComparison } from '@/components/weekly-chart-comparison';
import { WeeklySalesBranches } from '@/components/weekly-sales-branches';
import { WeeklyErrorBoundary, WeeklySalesComparison } from '@/components/weekly-sales-comparison';
import { CustomBranchesProvider } from '@/contexts/custom-branches-context';
import { DailyChartProvider } from '@/contexts/daily-chart-context';
import { MonthlyChartProvider } from '@/contexts/monthly-chart-context';
import { WeeklyChartProvider } from '@/contexts/weekly-chart-context';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    restoreDate?: {
        from: string;
        to: string;
    };
}

function DashboardContent({ restoreDate }: DashboardProps = {}) {
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
    const { currentDateRange, originalDateRange, setCurrentDateRange, setOriginalDateRange } = useDashboardState();
    const hasInitialized = useRef(false);
    const hasSetOriginal = useRef(false);

    // Initialize from restored date (from BranchDetails return) or dashboard state
    useEffect(() => {
        // Prevent multiple initializations
        if (hasInitialized.current) return;

        console.log('🟦 [Dashboard] Initialization effect running:', {
            hasRestoreDate: !!restoreDate,
            hasCurrentDateRange: !!currentDateRange,
            hasOriginalDateRange: !!originalDateRange,
            hasSelectedDateRange: !!selectedDateRange,
            restoreDate,
            currentDateRange,
            originalDateRange,
        });

        try {
            // Priority 1: Restore date from BranchDetails return navigation
            if (restoreDate) {
                const restoredRange: DateRange = {
                    from: new Date(restoreDate.from),
                    to: new Date(restoreDate.to),
                };

                // Validate restored dates
                if (restoredRange.from && restoredRange.to && !isNaN(restoredRange.from.getTime()) && !isNaN(restoredRange.to.getTime())) {
                    setSelectedDateRange(restoredRange);
                    setCurrentDateRange(restoredRange);
                    // Also restore the originalDateRange when coming back from branch
                    // Mark as user-selected since it was originally selected by the user
                    setOriginalDateRange(restoredRange, true); // true = forceUserSelected
                    console.log('✅ [Dashboard] Restored date from BranchDetails return (USER SELECTED):', {
                        from: restoreDate.from,
                        to: restoreDate.to,
                        isUserSelected: true,
                    });
                    hasInitialized.current = true;
                    hasSetOriginal.current = true;
                    return;
                }
            }

            // Priority 2: Use dashboard state if no restore date and no current selection
            if (currentDateRange && !selectedDateRange) {
                // Validate the date range before setting it
                const isValidRange =
                    currentDateRange.from &&
                    currentDateRange.to &&
                    currentDateRange.from instanceof Date &&
                    currentDateRange.to instanceof Date &&
                    !isNaN(currentDateRange.from.getTime()) &&
                    !isNaN(currentDateRange.to.getTime());

                if (isValidRange) {
                    setSelectedDateRange(currentDateRange);
                    hasInitialized.current = true;
                    console.log('✅ [Dashboard] Initialized from currentDateRange:', {
                        from: currentDateRange.from.toISOString(),
                        to: currentDateRange.to.toISOString(),
                    });
                } else {
                    console.warn('❌ [Dashboard] Invalid date range found in dashboard state, ignoring');
                }
            } else {
                console.log('ℹ️ [Dashboard] No initialization needed, waiting for user selection');
            }
        } catch (error) {
            console.error('❌ [Dashboard] Error initializing dashboard state:', error);
            // Continue with undefined selectedDateRange - MainFilterCalendar will auto-initialize
        }
    }, [restoreDate, currentDateRange]); // Keep currentDateRange but prevent re-runs with ref

    // Set originalDateRange if it's missing but we have currentDateRange (edge case handling)
    useEffect(() => {
        if (!originalDateRange && currentDateRange && !hasSetOriginal.current && !restoreDate) {
            setOriginalDateRange(currentDateRange);
            hasSetOriginal.current = true;
            console.log('📅 Dashboard: Setting missing originalDateRange from currentDateRange:', {
                from: currentDateRange.from?.toISOString(),
                to: currentDateRange.to?.toISOString(),
            });
        }
    }, [originalDateRange, currentDateRange, setOriginalDateRange, restoreDate]);

    const handleDateChange = (range: DateRange | undefined) => {
        console.log('📅 [Dashboard] handleDateChange called:', {
            range,
            hasSetOriginal: hasSetOriginal.current,
            hasRestoreDate: !!restoreDate,
            currentOriginal: originalDateRange,
        });

        setSelectedDateRange(range);
        setCurrentDateRange(range);

        // ALWAYS set originalDateRange when user makes a selection on the dashboard
        // This is the key fix - we need to always update it for the user's selection
        // Pass true as second parameter to force marking it as user-selected
        if (range && !restoreDate) {
            setOriginalDateRange(range, true); // true = forceUserSelected
            console.log('📅 [Dashboard] Setting original date range (USER SELECTION - will be preserved):', {
                from: range.from?.toISOString(),
                to: range.to?.toISOString(),
                wasAlreadySet: hasSetOriginal.current,
                isUserSelected: true,
            });
            hasSetOriginal.current = true;
        }
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-background p-4">
            <MainFilterCalendar value={selectedDateRange} onChange={handleDateChange} />

            <DailyChartProvider selectedDateRange={selectedDateRange}>
                <DailySalesComparison />
                <DailyChartComparison />
            </DailyChartProvider>

            <WeeklyChartProvider selectedDateRange={selectedDateRange}>
                <WeeklyErrorBoundary>
                    <WeeklySalesComparison selectedDateRange={selectedDateRange} />
                </WeeklyErrorBoundary>

                <WeeklyChartComparison selectedDateRange={selectedDateRange} />

                <WeeklySalesBranches selectedDateRange={selectedDateRange} />
            </WeeklyChartProvider>

            <MonthlyChartProvider selectedDateRange={selectedDateRange}>
                <MonthlyErrorBoundary>
                    <MonthlySalesComparison selectedDateRange={selectedDateRange} />
                </MonthlyErrorBoundary>

                <MonthlyChartComparison selectedDateRange={selectedDateRange} />

                <MonthlySalesBranches selectedDateRange={selectedDateRange} />
            </MonthlyChartProvider>

            <DailySalesBranches selectedDateRange={selectedDateRange} />

            <CustomSalesComparison selectedDateRange={selectedDateRange} />

            <CustomBranchesProvider selectedDateRange={selectedDateRange}>
                <CustomSalesBranches selectedDateRange={selectedDateRange} />
            </CustomBranchesProvider>
        </div>
    );
}

export default function Dashboard(props: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <DashboardContent {...props} />
        </AppLayout>
    );
}
