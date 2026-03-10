
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
    return (
        <div className="mx-auto max-w-[1600px] space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Breadcrumb Skeleton */}
            <Skeleton className="h-4 w-32" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">

                {/* LEFT COLUMN: Main Content */}
                <div className="min-w-0 space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-3/4 md:w-1/2 rounded" />
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-5 rounded-md" />
                            </div>
                            <Skeleton className="h-5 w-24 rounded border bg-muted/50" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="ml-1 space-y-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-64 w-full rounded-xl bg-sidebar border border-border/50" />
                    </div>

                    {/* Attachments */}
                    <div className="ml-1 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Skeleton className="h-16 w-full rounded-lg bg-background/50 border" />
                            <Skeleton className="h-16 w-full rounded-lg bg-background/50 border" />
                        </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Comments */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-5 w-8 rounded-full" />
                        </div>
                        <div className="space-y-8 pl-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="pl-12 relative space-y-2">
                                    <Skeleton className="absolute left-0 top-0 h-10 w-10 rounded-full ring-4 ring-background" />
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-24 w-full rounded-xl bg-sidebar border border-border/50" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar */}
                <div className="space-y-6 sticky top-6 lg:border-l lg:pl-10 border-border/60">
                    {/* Details Label */}
                    <Skeleton className="h-4 w-20 mb-2" />

                    {/* Assigned To Card */}
                    <div className="bg-sidebar border border-border/50 rounded-xl p-4 space-y-3">
                        <Skeleton className="h-3 w-24" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </div>

                    {/* Attributes Grid Card */}
                    <Skeleton className="h-48 w-full rounded-xl bg-sidebar border border-border/50" />

                    {/* Watchers Card */}
                    <div className="bg-sidebar border border-border/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-6 w-6 rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
