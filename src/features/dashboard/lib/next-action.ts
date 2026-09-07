import { db } from "@/lib/db";
import {
  contentSources,
  contentIntelligence,
  distributionPlans,
  distributionStrategies,
  distributionAssets,
} from "@/lib/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { type NextAction, type PipelineStats } from "../components/NextActionCard";

export interface DashboardActionData {
  nextAction: NextAction;
  pipeline: PipelineStats;
}

export async function getDashboardActionData(userId: string): Promise<DashboardActionData> {
  // Query pipeline counts & latest entities concurrently
  const [
    allSources,
    analyzedSources,
    allPlans,
    acceptedStrategies,
    readyAssets,
    latestReadyAsset,
    acceptedStrategyWithoutAsset,
    planWithRecommendedStrategies,
    unAnalyzedSource,
  ] = await Promise.all([
    db.query.contentSources.findMany({
      where: eq(contentSources.userId, userId),
      columns: { id: true },
    }),
    db
      .select({ id: contentIntelligence.id })
      .from(contentIntelligence)
      .innerJoin(contentSources, eq(contentSources.id, contentIntelligence.contentSourceId))
      .where(eq(contentSources.userId, userId)),
    db.query.distributionPlans.findMany({
      where: and(eq(distributionPlans.userId, userId), ne(distributionPlans.status, "ARCHIVED")),
      columns: { id: true },
    }),
    db
      .select({ id: distributionStrategies.id })
      .from(distributionStrategies)
      .innerJoin(distributionPlans, eq(distributionPlans.id, distributionStrategies.planId))
      .where(and(eq(distributionPlans.userId, userId), eq(distributionStrategies.status, "ACCEPTED"))),
    db
      .select({ id: distributionAssets.id })
      .from(distributionAssets)
      .innerJoin(distributionStrategies, eq(distributionStrategies.id, distributionAssets.strategyId))
      .innerJoin(distributionPlans, eq(distributionPlans.id, distributionStrategies.planId))
      .where(and(eq(distributionPlans.userId, userId), eq(distributionAssets.status, "READY"))),

    // 1. Next actionable: Latest READY asset
    db.query.distributionAssets.findFirst({
      where: and(
        eq(distributionAssets.userId, userId),
        eq(distributionAssets.status, "READY")
      ),
      orderBy: [desc(distributionAssets.updatedAt)],
      with: {
        strategy: {
          with: {
            plan: {
              with: {
                source: true,
              },
            },
          },
        },
      },
    }),

    // 2. Next actionable: ACCEPTED strategy without an asset
    db.query.distributionStrategies.findFirst({
      where: and(
        eq(distributionStrategies.status, "ACCEPTED")
      ),
      orderBy: [desc(distributionStrategies.updatedAt)],
      with: {
        plan: {
          with: {
            source: true,
          },
        },
        assets: true,
      },
    }),

    // 4. Next actionable: Plan with RECOMMENDED strategies awaiting review
    db.query.distributionPlans.findFirst({
      where: and(
        eq(distributionPlans.userId, userId),
        ne(distributionPlans.status, "ARCHIVED")
      ),
      orderBy: [desc(distributionPlans.createdAt)],
      with: {
        source: true,
        strategies: true,
      },
    }),

    // 5. Next actionable: Content source without intelligence
    db.query.contentSources.findFirst({
      where: eq(contentSources.userId, userId),
      orderBy: [desc(contentSources.createdAt)],
      with: {
        intelligence: true,
      },
    }),
  ]);

  const pipeline: PipelineStats = {
    totalSources: allSources.length,
    analyzedSources: analyzedSources.length,
    totalPlans: allPlans.length,
    acceptedStrategies: acceptedStrategies.length,
    readyAssets: readyAssets.length,
    pendingQueueItems: 0,
    completedResults: 0,
  };

  // Determine top priority next action:
  // Content -> Discover -> Plan -> Strategies -> Create/Review Assets

  // Condition 0: No content sources exist
  if (allSources.length === 0) {
    return {
      pipeline,
      nextAction: {
        step: 1,
        stepName: "Content",
        title: "Add Your First Content Source",
        description: "Import articles, newsletters, or notes to discover high-performing distribution angles.",
        ctaLabel: "Add Content",
        ctaHref: "/content/new",
      },
    };
  }

  // Condition 1: Ready asset exists and is polished for publishing
  if (latestReadyAsset) {
    const platform = latestReadyAsset.strategy?.platformId || "selected channel";
    const sourceTitle = latestReadyAsset.strategy?.plan?.source?.title || null;
    const contentId = latestReadyAsset.strategy?.plan?.source?.id;
    const strategyId = latestReadyAsset.strategy?.id;

    return {
      pipeline,
      nextAction: {
        step: 5,
        stepName: "Assets",
        title: `Review Ready Asset for ${platform}`,
        description: "Your platform copy is polished and marked READY. Review, copy, or distribute your post.",
        ctaLabel: "View Asset",
        ctaHref: `/content/${contentId}/distribution/${strategyId}`,
        sourceTitle,
        contentId,
        strategyId,
      },
    };
  }

  // Condition 2: Accepted strategy exists without any asset drafted yet
  if (
    acceptedStrategyWithoutAsset &&
    acceptedStrategyWithoutAsset.plan?.userId === userId &&
    (!acceptedStrategyWithoutAsset.assets || acceptedStrategyWithoutAsset.assets.length === 0)
  ) {
    const platform = acceptedStrategyWithoutAsset.platformId || "channel";
    const sourceTitle = acceptedStrategyWithoutAsset.plan.source.title;
    const contentId = acceptedStrategyWithoutAsset.plan.source.id;
    const strategyId = acceptedStrategyWithoutAsset.id;

    return {
      pipeline,
      nextAction: {
        step: 5,
        stepName: "Create Assets",
        title: `Draft Asset for ${platform}`,
        description: "Approved strategy is ready for copy generation. Create platform-native copy to distribute.",
        ctaLabel: "Create Asset",
        ctaHref: `/content/${contentId}/distribution/${strategyId}`,
        sourceTitle,
        contentId,
        strategyId,
      },
    };
  }

  // Condition 4: Plan exists with unreviewed recommended strategies
  if (
    planWithRecommendedStrategies &&
    planWithRecommendedStrategies.strategies &&
    planWithRecommendedStrategies.strategies.some((s) => s.status === "RECOMMENDED")
  ) {
    const sourceTitle = planWithRecommendedStrategies.source.title;
    const contentId = planWithRecommendedStrategies.source.id;

    return {
      pipeline,
      nextAction: {
        step: 4,
        stepName: "Strategies",
        title: "Review Recommended Strategies",
        description: "Explore AI-recommended multi-platform angles for your content and approve the ones you want to publish.",
        ctaLabel: "Review Strategies",
        ctaHref: `/content/${contentId}/distribution`,
        sourceTitle,
        contentId,
      },
    };
  }

  // Condition 5: Unanalyzed content source exists
  if (unAnalyzedSource && !unAnalyzedSource.intelligence) {
    return {
      pipeline,
      nextAction: {
        step: 2,
        stepName: "Discover",
        title: "Discover Insights & Extract Angles",
        description: "Extract core thesis, topics, and distribution ideas from your recent content source.",
        ctaLabel: "Discover Insights",
        ctaHref: `/content/${unAnalyzedSource.id}`,
        sourceTitle: unAnalyzedSource.title,
        contentId: unAnalyzedSource.id,
      },
    };
  }

  // Fallback: Everything active is complete -> View Plans
  return {
    pipeline,
    nextAction: {
      step: 3,
      stepName: "Plans",
      title: "Workspace Up to Date",
      description: "All active strategies and assets are prepared. Create new content or review your distribution plans.",
      ctaLabel: "View Plans",
      ctaHref: "/plans",
    },
  };
}
