import { Skeleton } from "@/components/ui/skeleton";

export default function NuevoTicketLoading() {
  return (
    <div className="max-w-6xl mx-auto pb-2">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="flex gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Card 1: Classification only (initial state) */}
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-40 mb-1" />
            <Skeleton className="h-3 w-72 opacity-60 mb-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-36 rounded-md" />
              <Skeleton className="h-3 w-2 opacity-30" />
              <Skeleton className="h-7 w-28 rounded-md" />
              <Skeleton className="h-3 w-2 opacity-30" />
              <Skeleton className="h-7 w-28 rounded-md" />
            </div>
          </div>
        </div>

        {/* Sidebar (Desktop) */}
        <div className="hidden lg:flex lg:flex-col w-72 shrink-0 gap-4 sticky top-4">
          {/* Sidebar Card 1: Context / Tips */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Progress bar placeholder */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-1.5 w-5 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-3 w-6" />
            </div>

            <div className="border-t border-border" />

            {/* Area name placeholder */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3 w-48" />
            </div>

            <div className="border-t border-border/50" />

            {/* Tips */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2.5 pl-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Emergency notice */}
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>

          {/* Sidebar Card 2: Notificar a */}
          <Skeleton className="h-28 rounded-xl border border-border bg-card" />

          {/* Sidebar Card 3: Actions */}
          <Skeleton className="h-24 rounded-xl border border-border bg-card" />
        </div>
      </div>
    </div>
  );
}
