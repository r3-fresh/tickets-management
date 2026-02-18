import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Logo / Header */}
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>

                {/* Form skeleton */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}
