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
import { useState } from 'react';
import { DailyChartProvider } from '@/contexts/daily-chart-context';
import { WeeklyChartProvider } from '@/contexts/weekly-chart-context';
import { ApiLoadingProvider } from '@/contexts/api-loading-context';
import { DashboardLoadingCoordinator } from '@/components/loading/dashboard-loading-coordinator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const handleDateChange = (range: DateRange | undefined) => {
        setSelectedDateRange(range);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <ApiLoadingProvider>
                <DashboardLoadingCoordinator
                    dateRange={selectedDateRange}
                >
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-background p-4">
                        <MainFilterCalendar
                            value={selectedDateRange}
                            onChange={handleDateChange}
                        />

                        <DailyChartProvider selectedDateRange={selectedDateRange}>
                            <DailyChartComparison />
                            <DailySalesComparison />
                        </DailyChartProvider>

                        <WeeklyChartProvider selectedDateRange={selectedDateRange}>
                            <WeeklyErrorBoundary>
                                <WeeklySalesComparison
                                    selectedDateRange={selectedDateRange}
                                />
                            </WeeklyErrorBoundary>

                            <WeeklyChartComparison
                                selectedDateRange={selectedDateRange}
                            />
                        </WeeklyChartProvider>

                        <MonthlyErrorBoundary>
                            <MonthlySalesComparison
                                selectedDateRange={selectedDateRange}
                            />
                        </MonthlyErrorBoundary>

                        <MonthlyChartComparison
                            selectedDateRange={selectedDateRange}
                        />

                        <DailySalesBranches
                            selectedDateRange={selectedDateRange}
                        />

                        <WeeklySalesBranches
                            selectedDateRange={selectedDateRange}
                        />

                        <MonthlySalesBranches
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
            </ApiLoadingProvider>
        </AppLayout>
    );
}
