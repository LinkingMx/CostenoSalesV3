import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MainFilterCalendar, type DateRange } from '@/components/main-filter-calendar';
import { DailySalesComparison } from '@/components/daily-sales-comparison';
import { DailyChartComparison } from '@/components/daily-chart-comparison';
import { WeeklySalesComparison, WeeklyErrorBoundary } from '@/components/weekly-sales-comparison';
import { WeeklyChartComparison } from '@/components/weekly-chart-comparison';
import { MonthlySalesComparison, MonthlyErrorBoundary } from '@/components/monthly-sales-comparison';
import { MonthlyChartComparison } from '@/components/monthly-chart-comparison';
import { CustomSalesComparison } from '@/components/custom-sales-comparison';
import { CustomSalesBranches } from '@/components/custom-sales-branches';
import { DailySalesBranches } from '@/components/daily-sales-branches';
import { WeeklySalesBranches } from '@/components/weekly-sales-branches';
import { MonthlySalesBranches } from '@/components/monthly-sales-branches';
import React, { useState, useEffect, useRef } from 'react';
import { DailyChartProvider } from '@/contexts/daily-chart-context';
import { WeeklyChartProvider } from '@/contexts/weekly-chart-context';
import { MonthlyChartProvider } from '@/contexts/monthly-chart-context';
import { ApiLoadingProvider, useApiLoadingContext } from '@/contexts/api-loading-context';
import { DashboardLoadingCoordinator } from '@/components/loading/dashboard-loading-coordinator';
import { useDashboardState } from '@/hooks/use-dashboard-state';

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
    const { currentDateRange, setCurrentDateRange } = useDashboardState();
    const hasInitialized = useRef(false);

    // Initialize from restored date (from BranchDetails return) or dashboard state
    useEffect(() => {
        // Prevent multiple initializations
        if (hasInitialized.current) return;

        try {
            // Priority 1: Restore date from BranchDetails return navigation
            if (restoreDate) {
                const restoredRange: DateRange = {
                    from: new Date(restoreDate.from),
                    to: new Date(restoreDate.to)
                };

                // Validate restored dates
                if (restoredRange.from && restoredRange.to && !isNaN(restoredRange.from.getTime()) && !isNaN(restoredRange.to.getTime())) {
                    setSelectedDateRange(restoredRange);
                    setCurrentDateRange(restoredRange);
                    console.log('📅 Restored original date from BranchDetails:', restoreDate.from);
                    hasInitialized.current = true;
                    return;
                }
            }

            // Priority 2: Use dashboard state if no restore date and no current selection
            if (currentDateRange && !selectedDateRange) {
                // Validate the date range before setting it
                const isValidRange = currentDateRange.from && currentDateRange.to &&
                    currentDateRange.from instanceof Date && currentDateRange.to instanceof Date &&
                    !isNaN(currentDateRange.from.getTime()) && !isNaN(currentDateRange.to.getTime());

                if (isValidRange) {
                    setSelectedDateRange(currentDateRange);
                    hasInitialized.current = true;
                } else {
                    console.warn('Invalid date range found in dashboard state, ignoring');
                }
            }
        } catch (error) {
            console.error('Error initializing dashboard state:', error);
            // Continue with undefined selectedDateRange - MainFilterCalendar will auto-initialize
        }
    }, [restoreDate, currentDateRange]); // Keep currentDateRange but prevent re-runs with ref

    const handleDateChange = (range: DateRange | undefined) => {
        setSelectedDateRange(range);
        setCurrentDateRange(range);
    };

    return (
        <DashboardLoadingCoordinator
            dateRange={selectedDateRange}
            skipInitialLoading={!!restoreDate}
        >
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-background p-4">
                        <MainFilterCalendar
                            value={selectedDateRange}
                            onChange={handleDateChange}
                        />

                        <DailyChartProvider selectedDateRange={selectedDateRange}>
                            <DailySalesComparison />
                            <DailyChartComparison />
                        </DailyChartProvider>

                        <WeeklyChartProvider
                            selectedDateRange={selectedDateRange}
                            skipLoading={!!restoreDate}
                        >
                            <WeeklyErrorBoundary>
                                <WeeklySalesComparison
                                    selectedDateRange={selectedDateRange}
                                />
                            </WeeklyErrorBoundary>

                            <WeeklyChartComparison
                                selectedDateRange={selectedDateRange}
                            />

                            <WeeklySalesBranches
                                selectedDateRange={selectedDateRange}
                            />
                        </WeeklyChartProvider>

                        <MonthlyChartProvider
                            selectedDateRange={selectedDateRange}
                            skipLoading={!!restoreDate}
                        >
                            <MonthlyErrorBoundary>
                                <MonthlySalesComparison
                                    selectedDateRange={selectedDateRange}
                                />
                            </MonthlyErrorBoundary>

                            <MonthlyChartComparison
                                selectedDateRange={selectedDateRange}
                            />

                            <MonthlySalesBranches
                                selectedDateRange={selectedDateRange}
                            />
                        </MonthlyChartProvider>

                        <DailySalesBranches
                            selectedDateRange={selectedDateRange}
                        />

                        <CustomSalesComparison
                            selectedDateRange={selectedDateRange}
                        />

                        <CustomSalesBranches
                            selectedDateRange={selectedDateRange}
                        />
                    </div>
        </DashboardLoadingCoordinator>
    );
}

export default function Dashboard(props: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <ApiLoadingProvider>
                <DashboardContent {...props} />
            </ApiLoadingProvider>
        </AppLayout>
    );
}
