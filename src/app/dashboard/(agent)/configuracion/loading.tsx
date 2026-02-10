export default function ConfiguracionLoading() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="h-4 w-44 animate-pulse rounded bg-muted" />

            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 w-60 animate-pulse rounded bg-muted" />
                <div className="h-4 w-72 animate-pulse rounded bg-muted" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b pb-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-9 w-28 animate-pulse rounded-md bg-muted" />
                ))}
            </div>

            {/* Tab content skeleton */}
            <div className="space-y-4">
                <div className="h-48 animate-pulse rounded-lg bg-muted" />
                <div className="h-32 animate-pulse rounded-lg bg-muted" />
            </div>
        </div>
    );
}
