/**
 * Daily Chart Loading Skeleton
 * Loading state component for daily chart comparison
 */

/**
 * Loading skeleton for the daily chart comparison component.
 * Displays animated placeholder content while data is being fetched.
 */
export function DailyChartSkeleton({ height = 300 }: { height?: number }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            {/* Header skeleton */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    <div>
                        <div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </div>

            {/* Chart skeleton */}
            <div className="relative overflow-hidden rounded bg-muted/20" style={{ height }}>
                {/* Animated bars */}
                <div className="absolute right-0 bottom-0 left-0 flex items-end justify-around px-8 pb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2" style={{ width: '20%' }}>
                            <div
                                className="w-full animate-pulse rounded-t bg-muted"
                                style={{
                                    height: `${Math.random() * 60 + 20}%`,
                                    animationDelay: `${i * 100}ms`,
                                }}
                            />
                            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>

                {/* Grid lines skeleton */}
                <div className="absolute inset-0 flex flex-col justify-between py-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-px bg-border/30" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DailyChartSkeleton;
