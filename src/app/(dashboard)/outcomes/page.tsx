import { db } from "@/lib/db";
import { distributionQueueItems, distributionOutcomes } from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PLATFORMS } from "@/features/platforms/definitions";
import { format } from "date-fns";

export default async function OutcomesPage() {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const completedItems = await db.query.distributionQueueItems.findMany({
    where: and(
      eq(distributionQueueItems.userId, userId),
      eq(distributionQueueItems.status, "COMPLETED")
    ),
    with: {
      strategy: {
        with: {
          idea: true,
          audience: true,
          plan: true,
        },
      },
      asset: true,
      outcomes: {
        orderBy: [asc(distributionOutcomes.observedAt)],
      },
    },
    orderBy: [desc(distributionQueueItems.updatedAt)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results & Performance</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track real-world performance, audience response, and learnings from executed distributions.
        </p>
      </div>

      {completedItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">
            No executed distributions found yet. Complete an item in your queue to track results.
          </p>
          <Link href="/queue" className="text-sm text-primary hover:underline font-medium">
            Go to Execution Queue &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {completedItems.map((item) => {
            const platformName =
              PLATFORMS[item.strategy.platformId as keyof typeof PLATFORMS]?.name ||
              item.strategy.platformId;
            const outcomeCount = item.outcomes.length;

            return (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {platformName} - {item.strategy.formatId}
                    </CardTitle>
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-md border border-green-200">
                      {outcomeCount} observation{outcomeCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>Audience:</strong> {item.strategy.audience.name}</span>
                    {item.strategy.idea && (
                      <span><strong>Idea:</strong> {item.strategy.idea.title}</span>
                    )}
                    <span><strong>Scheduled:</strong> {format(new Date(item.scheduledAt), "MMM d, yyyy")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.expectedOutcome && (
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md border border-blue-200 text-sm">
                      <strong>Expected:</strong> {item.expectedOutcome}
                    </div>
                  )}

                  {item.outcomes.length > 0 ? (
                    <div className="space-y-2">
                      {item.outcomes.map((o) => {
                        const metricEntries = Object.entries(o.metrics as Record<string, number>).filter(([, v]) => v > 0);
                        return (
                          <div key={o.id} className="text-sm border rounded-md p-3 bg-muted/10">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{format(new Date(o.observedAt), "MMM d, yyyy")}</span>
                            </div>
                            {metricEntries.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {metricEntries.map(([k, v]) => (
                                  <span key={k} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs bg-secondary text-secondary-foreground">
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}
                            {o.notes && <p className="text-muted-foreground italic text-xs">{o.notes}</p>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No observations recorded yet.</p>
                  )}

                  <div className="flex justify-end pt-2">
                    <Link href={`/outcomes/${item.id}`} className="text-sm text-primary hover:underline font-medium">
                      {outcomeCount > 0 ? "Add Observation" : "Record Outcome"} &rarr;
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
