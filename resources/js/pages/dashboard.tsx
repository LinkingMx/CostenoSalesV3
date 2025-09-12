import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MainFilterCalendar, type DateRange } from '@/components/main-filter-calendar';
import { DailySalesComparison } from '@/components/daily-sales-comparison';
import { WeeklySalesComparison, WeeklyErrorBoundary } from '@/components/weekly-sales-comparison';
import { DailySalesBranches } from '@/components/daily-sales-branches';
import { useState } from 'react';

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
        console.log('Selected date range:', range);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <MainFilterCalendar 
                    value={selectedDateRange} 
                    onChange={handleDateChange}
                />
                
                <DailySalesComparison 
                    selectedDateRange={selectedDateRange}
                />
                
                <WeeklyErrorBoundary>
                    <WeeklySalesComparison 
                        selectedDateRange={selectedDateRange}
                    />
                </WeeklyErrorBoundary>
                
                <DailySalesBranches 
                    selectedDateRange={selectedDateRange}
                />
            </div>
        </AppLayout>
    );
}
