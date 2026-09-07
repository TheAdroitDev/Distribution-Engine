import { db } from "@/lib/db";
import { distributionQueueItems, distributionOutcomes } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PLATFORMS } from "@/features/platforms/definitions";
import { OutcomeForm } from "@/features/outcomes/components/OutcomeForm";
import { OutcomeTimeline } from "@/features/outcomes/components/OutcomeTimeline";
import { ExpectedOutcomeEditor } from "@/features/outcomes/components/ExpectedOutcomeEditor";
import Link from "next/link";

export default async function OutcomeDetailPage({ params }: { params: Promise<{ queueItemId: string }> }) {
  const resolvedParams = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const item = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, resolvedParams.queueItemId),
      eq(distributionQueueItems.userId, session.user.id)
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
  });

  if (!item) return notFound();

  const platformDef = PLATFORMS[item.strategy.platformId as keyof typeof PLATFORMS];
  const platformName = platformDef?.name || item.strategy.platformId;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/outcomes" className="text-muted-foreground hover:text-foreground">
          &larr; Back to Results
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outcome Tracking & Results</h1>
        <p className="text-muted-foreground mt-1">
          {platformName} - {item.strategy.formatId}
        </p>
      </div>

      {/* Execution Context */}
      <div className="p-4 bg-muted/20 border rounded-lg space-y-2 text-sm">
        <h3 className="font-semibold text-base mb-3">Execution Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="text-muted-foreground">Platform:</span> <span className="font-medium">{platformName}</span></div>
          <div><span className="text-muted-foreground">Format:</span> <span className="font-medium">{item.strategy.formatId}</span></div>
          <div><span className="text-muted-foreground">Audience:</span> <span className="font-medium">{item.strategy.audience.name}</span></div>
          <div><span className="text-muted-foreground">Goal:</span> <span className="font-medium">{item.strategy.goalId}</span></div>
          {item.strategy.idea && (
            <div><span className="text-muted-foreground">Idea:</span> <span className="font-medium">{item.strategy.idea.title}</span></div>
          )}
          {item.asset && (
            <div><span className="text-muted-foreground">Asset:</span> <span className="font-medium">{item.asset.title || item.asset.body.substring(0, 60) + "..."}</span></div>
          )}
        </div>
      </div>

      {/* Expected Outcome */}
      <ExpectedOutcomeEditor
        queueItemId={item.id}
        currentExpectedOutcome={item.expectedOutcome}
      />

      {/* Observation Timeline */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Observation Timeline</h2>
        <OutcomeTimeline
          expectedOutcome={item.expectedOutcome}
          outcomes={item.outcomes}
        />
      </div>

      {/* Record New Observation */}
      <OutcomeForm
        queueItemId={item.id}
        platformId={item.strategy.platformId}
        scheduledAt={item.scheduledAt}
      />
    </div>
  );
}
