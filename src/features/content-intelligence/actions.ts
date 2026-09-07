"use server";

import { db } from "@/lib/db";
import { contentSources, contentIntelligence, contentIdeas, distributionPlans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { analyzeContent } from "./lib/analyzer";
import { createDistributionPlan } from "@/features/distribution/actions";
import { revalidatePath } from "next/cache";

export async function analyzeContentSource(sourceId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    // Verify ownership
    const source = await db.query.contentSources.findFirst({
      where: and(
        eq(contentSources.id, sourceId),
        eq(contentSources.userId, session.user.id)
      )
    });

    if (!source) {
      return { success: false, error: "Content source not found or unauthorized." };
    }

    // Check if user previously had a distribution plan
    const hadExistingPlan = db.query.distributionPlans
      ? !!(await db.query.distributionPlans.findFirst({
          where: and(
            eq(distributionPlans.contentSourceId, sourceId),
            eq(distributionPlans.userId, session.user.id)
          )
        }))
      : false;

    // Call AI
    const intelligenceResult = await analyzeContent(source.rawContent);

    // Persist in transaction
    await db.transaction(async (tx) => {
      // Clean up previous distribution plan & intelligence for idempotency (re-analysis)
      await tx.delete(distributionPlans).where(
        and(eq(distributionPlans.contentSourceId, sourceId), eq(distributionPlans.userId, session.user.id))
      );
      await tx.delete(contentIntelligence).where(eq(contentIntelligence.contentSourceId, sourceId));

      const [intelligenceRecord] = await tx.insert(contentIntelligence).values({
        contentSourceId: sourceId,
        summary: intelligenceResult.summary,
        coreThesis: intelligenceResult.coreThesis,
        topics: intelligenceResult.topics,
        technicalConcepts: intelligenceResult.technicalConcepts,
        opinions: intelligenceResult.opinions,
        lessons: intelligenceResult.lessons,
        examples: intelligenceResult.examples,
        audiences: intelligenceResult.audiences,
      }).returning({ id: contentIntelligence.id });

      if (intelligenceResult.ideas.length > 0) {
        await tx.insert(contentIdeas).values(
          intelligenceResult.ideas.map(idea => ({
            contentIntelligenceId: intelligenceRecord.id,
            title: idea.title,
            summary: idea.summary,
            angle: idea.angle,
            sourceContext: idea.sourceContext,
            importance: idea.importance,
          }))
        );
      }
    });

    // If user previously had a distribution plan, automatically regenerate it with the new ideas
    if (hadExistingPlan) {
      await createDistributionPlan(sourceId);
    }

    revalidatePath(`/content/${sourceId}`);
    revalidatePath(`/content/${sourceId}/distribution`);
    revalidatePath("/content");
    revalidatePath("/plans");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to analyze content source:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to analyze content." };
  }
}
