export default function AreaLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-80 animate-pulse rounded bg-muted" />
            </div>

            {/* Filters skeleton */}
            <div className="flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-9 w-32 animate-pulse rounded-md bg-muted" />
                ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <div className="grid grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="grid grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <div key={j} className="h-4 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
