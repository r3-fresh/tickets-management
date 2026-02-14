export default function TicketDetailLoading() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                    <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-8 w-[28rem] max-w-full animate-pulse rounded bg-muted" />
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description card */}
                    <div className="rounded-lg border bg-card">
                        <div className="px-5 py-3 border-b">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="px-5 py-4 space-y-2">
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        </div>
                    </div>

                    {/* Technical details card */}
                    <div className="rounded-lg border bg-card">
                        <div className="px-5 py-3 border-b">
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="px-5 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="relative">
                            <div className="absolute left-[19px] top-5 bottom-5 w-px bg-border" />
                            <div className="space-y-5">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted shrink-0 ring-4 ring-background relative z-10" />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between">
                                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                                                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                                            </div>
                                            <div className="h-14 animate-pulse rounded-lg bg-muted/30 border" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="rounded-lg border bg-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-7 w-7 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
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
