"use server";

import { db } from "@/lib/db";
import { 
  distributionStrategies, 
  distributionAssets, 
  distributionProfiles 
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { generateValidatedAsset } from "./lib/asset-generator";
import { PLATFORMS } from "@/features/platforms/definitions";
import { revalidatePath } from "next/cache";

export async function generateAssetAction(strategyId: string, previousDraft?: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  // 1. Fetch Strategy + Deep Context + Ownership validation
  const strategy = await db.query.distributionStrategies.findFirst({
    where: eq(distributionStrategies.id, strategyId),
    with: {
      plan: {
        with: {
          source: {
            with: {
              intelligence: true
            }
          }
        }
      },
      idea: true,
      audience: true,
    }
  });

  if (!strategy || strategy.plan.userId !== userId) {
    return { success: false, error: "Strategy not found or unauthorized." };
  }

  if (strategy.status !== "ACCEPTED") {
    return { success: false, error: "Can only generate assets for ACCEPTED strategies." };
  }

  const profile = await db.query.distributionProfiles.findFirst({
    where: eq(distributionProfiles.userId, userId)
  });

  const platformDef = PLATFORMS[strategy.platformId as keyof typeof PLATFORMS];
  if (!platformDef) {
    return { success: false, error: "Invalid platform on strategy." };
  }

  // 2. Prepare Bounded Context
  const context = {
    sourceTitle: strategy.plan.source.title,
    sourceType: strategy.plan.source.type,
    sourceRawContent: strategy.plan.source.rawContent,
    intelligenceSummary: strategy.plan.source.intelligence.summary,
    intelligenceTopics: strategy.plan.source.intelligence.topics,
    intelligenceConcepts: strategy.plan.source.intelligence.technicalConcepts,
    ideaTitle: strategy.idea.title,
    ideaSummary: strategy.idea.summary,
    ideaAngle: strategy.idea.angle,
    profileExpertise: profile?.expertise || [],
    profileVoice: profile?.voicePreferences || {},
    profileContentPrefs: profile?.contentPreferences || [],
    audienceName: strategy.audience.name,
    audienceContext: strategy.audience.description,
    strategyPlatform: platformDef.name,
    strategyPlatformId: platformDef.id,
    strategyFormat: strategy.formatId,
    strategyFormatId: strategy.formatId,
    strategyAction: strategy.actionId,
    strategyAngle: strategy.angle,
    strategyRationale: strategy.rationale,
    platformConstraints: platformDef.constraints,
    platformStrategyRules: platformDef.strategyRules,
    previousDraft,
  };

  // 3. Generate Validated Domain Result (Pure Logic)
  let validatedResult;
  try {
    validatedResult = await generateValidatedAsset(context);
  } catch (error: unknown) {
    console.error("Asset generation/validation failed:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate valid asset.";
    return { success: false, error: msg };
  }

  // 4. Atomic Persistence & Regeneration Policy
  try {
    const assetId = await db.transaction(async (tx) => {
      // Find existing assets for this strategy
      const existingAssets = await tx.query.distributionAssets.findMany({
        where: and(
          eq(distributionAssets.strategyId, strategyId),
          eq(distributionAssets.userId, userId)
        )
      });

      // Regeneration Policy:
      // If DRAFT exists, we can delete/overwrite it.
      // If READY exists, archive it.
      for (const existing of existingAssets) {
        if (existing.status === 'DRAFT') {
          await tx.delete(distributionAssets).where(eq(distributionAssets.id, existing.id));
        } else if (existing.status === 'READY') {
          await tx.update(distributionAssets)
            .set({ status: 'ARCHIVED', updatedAt: new Date() })
            .where(eq(distributionAssets.id, existing.id));
        }
      }

      // Create new DRAFT asset
      const [newAsset] = await tx.insert(distributionAssets).values({
        strategyId,
        userId,
        formatId: validatedResult.formatId, // Authoritatively mapped
        title: validatedResult.title,
        body: validatedResult.body,
        metadata: validatedResult.metadata,
        status: "DRAFT",
      }).returning();

      return newAsset.id;
    });

    revalidatePath(`/content/${strategy.plan.contentSourceId}/distribution`);
    return { success: true, assetId };
  } catch (error) {
    console.error("Asset persistence failed:", error);
    return { success: false, error: "Failed to persist generated asset." };
  }
}

export async function saveAssetAction(assetId: string, data: { title: string | null; body: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };

  const asset = await db.query.distributionAssets.findFirst({
    where: and(eq(distributionAssets.id, assetId), eq(distributionAssets.userId, session.user.id)),
    with: { strategy: { with: { plan: true } } }
  });

  if (!asset) return { success: false, error: "Not found or unauthorized." };

  await db.update(distributionAssets)
    .set({
      title: data.title,
      body: data.body,
      status: "READY",
      updatedAt: new Date()
    })
    .where(eq(distributionAssets.id, assetId));

  revalidatePath(`/content/${asset.strategy.plan.contentSourceId}/distribution/${asset.strategyId}`);
  return { success: true };
}
