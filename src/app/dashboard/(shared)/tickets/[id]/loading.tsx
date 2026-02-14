
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-20">
            {/* Breadcrumb Skeleton */}
            <Skeleton className="h-4 w-32" />

            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 flex-1">
                    {/* Metadata Row */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    {/* Title */}
                    <Skeleton className="h-8 w-3/4 md:w-1/2 rounded" />
                    {/* Author */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
                {/* Main Content */}
                <div className="space-y-8">
                    {/* Description */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                    {/* Tech Details */}
                    <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    {/* Attachments */}
                    <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    </div>
                    {/* Comments */}
                    <div className="space-y-6">
                        <Skeleton className="h-5 w-36" />
                        <div className="space-y-6 pl-4 border-l">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="pl-6 space-y-2 relative">
                                    <Skeleton className="absolute left-[-10px] top-0 h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-20 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
