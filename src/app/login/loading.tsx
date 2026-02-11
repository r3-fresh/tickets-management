export default function LoginLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo / Header */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-64 animate-pulse rounded bg-muted" />
                </div>

                {/* Form skeleton */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                    </div>
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}
