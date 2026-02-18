import { Skeleton } from "@/components/ui/skeleton";

export default function SistemaLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Skeleton className="h-4 w-52" />

            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-28" />
                ))}
            </div>

            {/* Tab content skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-48 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
        </div>
    );
}
