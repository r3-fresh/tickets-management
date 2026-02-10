export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb skeleton */}
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />

            {/* Title skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-72 animate-pulse rounded bg-muted" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
    );
}
