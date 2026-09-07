import { Skeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-3 w-28" />

            <div className="grid grid-cols-2 gap-2 text-sm pt-2">
              <Skeleton className="h-14 rounded-md" />
              <Skeleton className="h-14 rounded-md" />
              <Skeleton className="h-14 rounded-md col-span-2" />
            </div>

            <Skeleton className="h-9 w-full rounded-lg mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
