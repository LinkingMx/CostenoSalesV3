/**
 * Skeleton System Test Component
 *
 * This component provides a quick way to test all daily skeleton components
 * and verify the 3-second minimum loading duration functionality.
 *
 * USAGE: Import and use this component during development to test skeletons
 * DO NOT USE IN PRODUCTION - This is for testing purposes only
 */

import * as React from 'react';
import { useMinimumLoadingDuration } from '@/hooks/use-minimum-loading-duration';
import { DailySalesBranchesSkeleton } from '@/components/daily-sales-branches/components/daily-sales-branches-skeleton';
import { DailyChartSkeleton } from '@/components/daily-chart-comparison/components/daily-chart-skeleton';
import { SalesComparisonSkeleton } from '@/components/daily-sales-comparison/components/sales-comparison-skeleton';

export const SkeletonSystemTest = () => {
    const [actualLoading, setActualLoading] = React.useState(false);
    const [testDuration, setTestDuration] = React.useState(3000);

    // Test the minimum loading duration hook
    const isLoading = useMinimumLoadingDuration(actualLoading, testDuration);

    const startLoadingTest = () => {
        setActualLoading(true);
        // Simulate API call that completes quickly (500ms)
        setTimeout(() => {
            setActualLoading(false);
        }, 500);
    };

    const [startTime, setStartTime] = React.useState<number | null>(null);
    const [endTime, setEndTime] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (isLoading && !actualLoading && !startTime) {
            setStartTime(Date.now());
        }
        if (!isLoading && startTime && !endTime) {
            setEndTime(Date.now());
        }
    }, [isLoading, actualLoading, startTime, endTime]);

    const duration = startTime && endTime ? endTime - startTime : null;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-4 border">
                <h2 className="text-xl font-bold mb-4">Skeleton Loading System Test</h2>

                <div className="flex gap-4 items-center mb-4">
                    <button
                        onClick={startLoadingTest}
                        disabled={isLoading}
                        className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                    >
                        {isLoading ? 'Testing...' : 'Test 3-Second Minimum Loading'}
                    </button>

                    <label className="flex items-center gap-2">
                        Minimum Duration (ms):
                        <input
                            type="number"
                            value={testDuration}
                            onChange={(e) => setTestDuration(Number(e.target.value))}
                            className="px-2 py-1 border rounded w-20"
                            disabled={isLoading}
                        />
                    </label>
                </div>

                <div className="text-sm space-y-1">
                    <p>Actual Loading State: <span className={actualLoading ? 'text-red-500' : 'text-green-500'}>{actualLoading ? 'Loading' : 'Complete'}</span></p>
                    <p>Display Loading State: <span className={isLoading ? 'text-red-500' : 'text-green-500'}>{isLoading ? 'Loading' : 'Complete'}</span></p>
                    {duration && <p>Total Duration: <span className="font-bold">{duration}ms</span> (Expected: {testDuration}ms)</p>}
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Testing Skeleton Components:</h3>

                    <div>
                        <h4 className="font-medium mb-2">Daily Sales Branches Skeleton</h4>
                        <DailySalesBranchesSkeleton itemCount={3} />
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Daily Chart Comparison Skeleton</h4>
                        <DailyChartSkeleton height={210} />
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Daily Sales Comparison Skeleton</h4>
                        <SalesComparisonSkeleton cardCount={4} />
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-green-800 font-semibold">Test Complete!</h3>
                    <p className="text-green-700">All skeleton components rendered successfully.</p>
                    {duration && (
                        <p className="text-green-600 text-sm mt-1">
                            Duration test: {duration >= testDuration ? '✅ PASSED' : '❌ FAILED'}
                            ({duration}ms of expected {testDuration}ms)
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkeletonSystemTest;