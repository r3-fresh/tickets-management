import { Skeleton } from "@/components/ui/skeleton";

export default function UsuariosLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Skeleton className="h-4 w-40" />

            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <div className="grid grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            {Array.from({ length: 4 }).map((_, j) => (
                                <Skeleton key={j} className="h-4" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
