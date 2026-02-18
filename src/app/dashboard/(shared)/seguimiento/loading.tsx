import { Skeleton } from "@/components/ui/skeleton";

export default function SeguimientoLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Skeleton className="h-4 w-32" />

            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Filters skeleton */}
            <div className="flex flex-wrap gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-32" />
                ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <div className="grid grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-4" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="grid grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <Skeleton key={j} className="h-4" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
