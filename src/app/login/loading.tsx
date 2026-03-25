import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel de branding skeleton - visible en desktop */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-foreground flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg bg-background/20" />
          <Skeleton className="h-4 w-48 bg-background/20" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 bg-background/20" />
          <Skeleton className="h-12 w-1/2 bg-background/20" />
          <Skeleton className="h-16 w-5/6 bg-background/20" />
        </div>
        <Skeleton className="h-4 w-64 bg-background/20" />
      </div>

      {/* Panel de formulario skeleton */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm space-y-10">
          {/* Header con branding - solo mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Título y acción */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-11 w-full rounded-md" />
          </div>

          {/* Feature highlights */}
          <div className="space-y-5">
            <Separator />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-8 rounded-md shrink-0" />
                  <div className="space-y-2 w-full pt-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
