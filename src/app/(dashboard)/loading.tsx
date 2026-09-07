import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in-50 duration-200">
      {/* Main Dynamic Content Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-44 sm:w-60" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-lg shrink-0" />
            </div>
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
