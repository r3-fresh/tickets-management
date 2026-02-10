export default function TicketDetailLoading() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-9 w-96 animate-pulse rounded bg-muted" />
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Technical details accordion */}
                    <div className="h-12 animate-pulse rounded-lg border bg-muted" />

                    {/* Description accordion */}
                    <div className="h-48 animate-pulse rounded-lg border bg-muted" />

                    {/* Comments */}
                    <div className="space-y-4">
                        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="h-10 w-10 animate-pulse rounded-full bg-muted shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                    </div>
                                    <div className="h-16 animate-pulse rounded-lg bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 space-y-4">
                        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
