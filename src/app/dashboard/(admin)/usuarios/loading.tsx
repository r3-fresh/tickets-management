export default function UsuariosLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 w-56 animate-pulse rounded bg-muted" />
                <div className="h-4 w-80 animate-pulse rounded bg-muted" />
            </div>

            {/* Table skeleton */}
            <div className="rounded-lg border bg-card">
                <div className="border-b p-4">
                    <div className="grid grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-4 animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            </div>
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="h-4 animate-pulse rounded bg-muted" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
