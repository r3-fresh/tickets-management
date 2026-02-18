import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </div>

            {/* Content area */}
            <Skeleton className="h-64 rounded-lg" />
        </div>
    );
}
