export default function NuevoTicketLoading() {
    return (
        <div className="mx-auto w-full max-w-6xl p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-1">
                    <div className="h-8 w-64 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-96 animate-pulse rounded bg-muted opacity-60" />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Main Content */}
                <div className="flex-1 w-full space-y-5">

                    {/* Card 1: Title & Classification */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="p-6 pb-2 space-y-4">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                            </div>

                            {/* Selects Row */}
                            <div className="flex gap-2 pt-2">
                                <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                                <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                                <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                            </div>
                        </div>

                        <div className="mx-6 border-t border-border mt-2" />

                        {/* Priority */}
                        <div className="px-6 py-5 space-y-2">
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-64 animate-pulse rounded bg-muted opacity-60" />
                            <div className="grid grid-cols-4 gap-2 pt-1">
                                <div className="h-8 animate-pulse rounded-md bg-muted" />
                                <div className="h-8 animate-pulse rounded-md bg-muted" />
                                <div className="h-8 animate-pulse rounded-md bg-muted" />
                                <div className="h-8 animate-pulse rounded-md bg-muted" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Location */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-40 animate-pulse rounded bg-muted opacity-60" />
                                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-40 animate-pulse rounded bg-muted opacity-60" />
                                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Description & Upload */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="p-6 pb-4 space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-full animate-pulse rounded bg-muted opacity-60" />
                            <div className="h-[200px] w-full animate-pulse rounded-md bg-muted mt-2" />
                        </div>

                        <div className="px-6 pb-6 pt-2 space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
                        </div>
                    </div>
                </div>

                {/* Sidebar (Desktop) */}
                <div className="hidden lg:flex lg:flex-col w-72 shrink-0 gap-4">
                    {/* Sidebar Card 1 */}
                    <div className="h-64 rounded-xl border border-border bg-card animate-pulse" />

                    {/* Sidebar Card 2 */}
                    <div className="h-32 rounded-xl border border-border bg-card animate-pulse" />

                    {/* Sidebar Card 3 */}
                    <div className="h-24 rounded-xl border border-border bg-card animate-pulse" />
                </div>
            </div>
        </div>
    );
}
