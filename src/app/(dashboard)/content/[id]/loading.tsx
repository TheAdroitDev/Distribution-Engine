import { Skeleton } from "@/components/ui/skeleton";

export default function ContentDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in-50 duration-200">
      {/* Breadcrumbs & Title Shell */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Main Content Area Skeletons */}
      <div className="space-y-6">
        {/* Original Content Card Skeleton */}
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        {/* Intelligence Card Skeleton */}
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-md" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
