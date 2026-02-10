export default function NuevoTicketLoading() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 w-52 animate-pulse rounded bg-muted" />
                <div className="h-4 w-80 animate-pulse rounded bg-muted" />
            </div>

            {/* Form skeleton */}
            <div className="rounded-lg border bg-card p-6 space-y-6">
                {/* Title field */}
                <div className="space-y-2">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                </div>

                {/* Description field */}
                <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-48 w-full animate-pulse rounded-md bg-muted" />
                </div>

                {/* Select fields row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                        </div>
                    ))}
                </div>

                {/* Submit button */}
                <div className="flex justify-end">
                    <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}
