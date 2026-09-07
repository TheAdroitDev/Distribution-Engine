import { db } from "@/lib/db";
import { distributionPlans, distributionStrategies } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StrategyCard } from "@/features/distribution/components/StrategyCard";
import { PlanGeneratorButton } from "@/features/distribution/components/PlanGeneratorButton";

export default async function DistributionPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getCachedSession();
  if (!session?.user?.id) return null;

  const plan = await db.query.distributionPlans.findFirst({
    where: and(
      eq(distributionPlans.contentSourceId, resolvedParams.id),
      eq(distributionPlans.userId, session.user.id)
    ),
    with: {
      source: {
        columns: {
          id: true,
          title: true,
        },
      },
      strategies: {
        orderBy: [desc(distributionStrategies.createdAt)],
        with: {
          assets: true,
          audience: true,
          idea: true,
        },
      },
    },
  });

  if (!plan) return notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/content/${plan.contentSourceId}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          &larr; Back to Content Detail
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distribution Strategies</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Source: <span className="font-semibold text-foreground">{plan.source.title}</span> &middot; Goal: {plan.primaryGoalId}
        </p>
      </div>

      {plan.strategies.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center bg-card space-y-3">
          <p className="text-muted-foreground">No strategies found in this plan.</p>
          <PlanGeneratorButton sourceId={plan.contentSourceId} />
        </div>
      ) : (
        <div className="space-y-6">
          {plan.strategies.map((strategy, idx) => (
            <StrategyCard key={strategy.id} strategy={strategy} index={idx + 1} contentSourceId={plan.contentSourceId} />
          ))}
        </div>
      )}
    </div>
  );
}
