
import { getCachedSession } from "@/lib/auth/session";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { getUserPlansWithCounts } from "@/features/distribution/queries";
import { derivePlanStatus } from "@/features/content/lib/content-state";

export default async function PlansHubPage() {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const plans = await getUserPlansWithCounts(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distribution Plans</h1>
        <p className="text-muted-foreground mt-1">
          Review and execute the distribution plans generated for your content.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/20 space-y-4">
          <p className="text-muted-foreground">Create a distribution plan from your content.</p>
          <Link href="/content" className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted hover:text-foreground">
            Go to Content
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const strategyCount = plan.strategies.length;
            const acceptedStrategies = plan.strategies.filter((s) => s.status === "ACCEPTED" || s.status === "COMPLETED").length;
            
            const assets = plan.strategies.flatMap((s) => s.assets);
            const readyAssetsCount = assets.filter((a) => a.status === "READY").length;
            
            const derivedStatus = derivePlanStatus(plan);

            return (
              <Card key={plan.id} className="flex flex-col transition-all hover:border-border/80 animate-morph-in">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg line-clamp-2" title={plan.source.title}>
                      {plan.source.title}
                    </CardTitle>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 transition-colors ${
                        derivedStatus === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : derivedStatus === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                          : derivedStatus === "RECOMMENDED"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {derivedStatus.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Created {format(new Date(plan.createdAt), "MMM d, yyyy")}
                  </div>
                  {plan.primaryGoalId && (
                    <div className="text-xs font-medium text-muted-foreground mt-1">
                      Goal: {plan.primaryGoalId.replace(/_/g, " ")}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded-md border">
                      <span className="block text-xs text-muted-foreground mb-1">Strategies</span>
                      <span className="font-semibold">{strategyCount}</span>
                      <span className="text-xs text-muted-foreground ml-1">({acceptedStrategies} accepted)</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md border">
                      <span className="block text-xs text-muted-foreground mb-1">Ready Assets</span>
                      <span className="font-semibold">{readyAssetsCount}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6 border-t mt-auto">
                  <Link href={`/content/${plan.contentSourceId}/distribution`} className="w-full mt-4 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-secondary-foreground px-4 text-sm font-medium hover:bg-secondary/80">
                    View Plan &rarr;
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
