"use server";

import { db } from "@/lib/db";
import { 
  distributionPlans, 
  distributionStrategies, 
  contentSources, 
  distributionProfiles, 
  audiences 
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { runStrategyEngine, type EngineInput } from "./lib/strategy-engine";
import { revalidatePath } from "next/cache";

export async function createDistributionPlan(contentSourceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  // 1. Fetch source + intelligence
  const source = await db.query.contentSources.findFirst({
    where: and(eq(contentSources.id, contentSourceId), eq(contentSources.userId, userId)),
    with: {
      intelligence: {
        with: {
          ideas: true
        }
      }
    }
  });

  if (!source) return { success: false, error: "Source not found." };
  if (!source.intelligence || source.intelligence.ideas.length === 0) {
    return { success: false, error: "Content must be analyzed first." };
  }

  // 2. Fetch Profile
  const profile = await db.query.distributionProfiles.findFirst({
    where: eq(distributionProfiles.userId, userId)
  });
  if (!profile || !profile.primaryGoal) {
    return { success: false, error: "Profile missing or primary goal not set." };
  }

  // 3. Fetch Audiences
  const userAudiences = await db.query.audiences.findMany({
    where: eq(audiences.userId, userId)
  });
  if (userAudiences.length === 0) {
    return { success: false, error: "Please define at least one audience in settings." };
  }

  // 4. Run Strategy Engine
  const engineInput: EngineInput = {
    contentSource: { id: source.id, title: source.title, rawContent: source.rawContent },
    intelligence: source.intelligence,
    ideas: source.intelligence.ideas,
    profile: {
      expertise: profile.expertise || [],
      topics: profile.topics || [],
      preferredPlatforms: profile.preferredPlatforms || [],
      primaryGoal: profile.primaryGoal
    },
    audiences: userAudiences
  };

  const finalStrategies = await runStrategyEngine(engineInput);

  // 5. Atomic Persistence
  try {
    const planId = await db.transaction(async (tx) => {
      // Delete existing DRAFT/RECOMMENDED plans for this source (idempotency policy)
      await tx.delete(distributionPlans).where(
        and(eq(distributionPlans.contentSourceId, source.id), eq(distributionPlans.userId, userId))
      );

      // Create new plan
      const [newPlan] = await tx.insert(distributionPlans).values({
        userId,
        contentSourceId: source.id,
        primaryGoalId: profile.primaryGoal!,
        status: "RECOMMENDED",
      }).returning();

      // Insert strategies. The engine handles plan sizing, ranking and diversity.
      const strategiesToInsert = finalStrategies.map((s, idx) => ({
        planId: newPlan.id,
        contentIdeaId: s.contentIdeaId,
        platformId: s.platformId,
        audienceId: s.audienceId,
        goalId: s.goalId,
        formatId: s.formatId,
        actionId: s.actionId,
        rank: idx + 1,
        score: s.finalScore,
        rationale: s.rationale,
        angle: s.angle,
        status: "RECOMMENDED" as const,
        origin: "AI_RECOMMENDED" as const,
      }));

      if (strategiesToInsert.length > 0) {
        await tx.insert(distributionStrategies).values(strategiesToInsert);
      }

      return newPlan.id;
    });

    revalidatePath(`/content/${contentSourceId}/distribution`);
    return { success: true, planId };
  } catch (error) {
    console.error("DB persistence failed:", error);
    return { success: false, error: "Failed to save distribution plan." };
  }
}

export async function updateStrategyStatus(strategyId: string, status: "ACCEPTED" | "REJECTED") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };

  // Verify ownership via join or subquery. Easiest is to find plan first or use exist query.
  // We can do an implicit check via subquery.
  
  // 1. Fetch strategy with plan
  const strategy = await db.query.distributionStrategies.findFirst({
    where: eq(distributionStrategies.id, strategyId),
    with: { plan: true }
  });

  if (!strategy || strategy.plan.userId !== session.user.id) {
    return { success: false, error: "Not found or unauthorized." };
  }

  await db.update(distributionStrategies)
    .set({ status, updatedAt: new Date() })
    .where(eq(distributionStrategies.id, strategyId));
    
  revalidatePath(`/content/${strategy.plan.contentSourceId}/distribution`);
  return { success: true };
}
