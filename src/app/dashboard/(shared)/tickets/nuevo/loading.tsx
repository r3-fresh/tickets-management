import { Skeleton } from "@/components/ui/skeleton";

export default function NuevoTicketLoading() {
    return (
        <div className="max-w-6xl mx-auto pb-2">
            {/* Header */}
            <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-8 w-64" />
            </div>

            <div className="flex gap-8 items-start">
                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* Card 1: Title & Classification */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="p-6 pb-4 space-y-4">
                            {/* Title Input */}
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                            </div>

                            {/* Selects Row */}
                            <div className="flex gap-2 pt-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-8 w-32" />
                            </div>
                        </div>

                        <div className="mx-6 border-t border-border" />

                        {/* Priority */}
                        <div className="px-6 py-5 space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-48 opacity-60" />
                            <div className="grid grid-cols-4 gap-2 pt-2">
                                <Skeleton className="h-8" />
                                <Skeleton className="h-8" />
                                <Skeleton className="h-8" />
                                <Skeleton className="h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Location */}
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-40 opacity-60" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-40 opacity-60" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Description & Upload */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="px-6 pt-5 pb-4 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-64 opacity-60" />
                            <Skeleton className="h-[150px] w-full mt-2" />
                        </div>

                        <div className="mx-6 border-t border-border" />

                        <div className="px-6 pt-4 pb-6 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Sidebar (Desktop Setup) */}
                <div className="hidden lg:flex lg:flex-col w-72 shrink-0 gap-4 sticky top-4">
                    {/* Sidebar Card 1: Tips */}
                    <Skeleton className="h-56 rounded-xl border border-border bg-card" />

                    {/* Sidebar Card 2: Notifications */}
                    <Skeleton className="h-28 rounded-xl border border-border bg-card" />

                    {/* Sidebar Card 3: Actions */}
                    <Skeleton className="h-24 rounded-xl border border-border bg-card" />
                </div>
            </div>
        </div>
    );
}
