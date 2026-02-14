export default function TicketDetailLoading() {
    return (
        <div className="space-y-5 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div>
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                {/* Title */}
                <div className="h-7 w-md max-w-full animate-pulse rounded bg-muted mb-2" />
                {/* Meta */}
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-border" />

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
                {/* Left: Tabs */}
                <div className="min-w-0 space-y-4">
                    {/* Tab bar */}
                    <div className="flex gap-0 border-b pb-0">
                        <div className="h-9 w-28 animate-pulse rounded-t bg-muted" />
                        <div className="h-9 w-32 animate-pulse rounded-t bg-muted ml-1" />
                        <div className="h-9 w-24 animate-pulse rounded-t bg-muted ml-1" />
                    </div>
                    {/* Content */}
                    <div className="space-y-2 pt-2">
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-4">
                    {/* Assignee */}
                    <div className="space-y-1.5">
                        <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                    <div className="h-px bg-border" />
                    {/* Watchers */}
                    <div className="space-y-1.5">
                        <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                            <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
                            <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                    <div className="h-px bg-border" />
                    {/* Metadata */}
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
                                <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
