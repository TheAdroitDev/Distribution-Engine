"use server";

import { db } from "@/lib/db";
import { distributionProfiles, audiences, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { profileSchema, audienceSchema, type ProfileInput, type AudienceInput } from "./validation";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: ProfileInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized." };

    const validated = profileSchema.parse(data);

    // Sync auto-analyze and auto-generate plan flags into contentPreferences
    const prefSet = new Set(validated.contentPreferences || []);
    if (validated.autoAnalyze) {
      prefSet.add("auto_analyze");
    } else {
      prefSet.delete("auto_analyze");
    }
    if (validated.autoGeneratePlan) {
      prefSet.add("auto_generate_plan");
    } else {
      prefSet.delete("auto_generate_plan");
    }

    const dbPayload = {
      expertise: validated.expertise,
      topics: validated.topics,
      preferredPlatforms: validated.preferredPlatforms,
      primaryGoal: validated.primaryGoal,
      secondaryGoals: validated.secondaryGoals,
      voicePreferences: validated.voicePreferences,
      promotionTolerance: validated.promotionTolerance,
      contentPreferences: Array.from(prefSet),
    };

    // Upsert profile
    const existing = await db.query.distributionProfiles.findFirst({
      where: eq(distributionProfiles.userId, session.user.id)
    });

    if (existing) {
      await db.update(distributionProfiles)
        .set(dbPayload)
        .where(eq(distributionProfiles.userId, session.user.id));
    } else {
      await db.insert(distributionProfiles).values({
        userId: session.user.id,
        ...dbPayload
      });
    }

    revalidatePath("/settings/profile");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update profile:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update profile." };
  }
}

export async function createAudience(data: AudienceInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized." };

    const validated = audienceSchema.parse(data);

    await db.insert(audiences).values({
      userId: session.user.id,
      name: validated.name,
      description: validated.description || null,
      interests: validated.interests,
      problems: validated.problems,
      platformAffinity: validated.platformAffinity,
    });

    revalidatePath("/settings/audiences");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create audience." };
  }
}

export async function updateAudience(id: string, data: AudienceInput) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized." };

    const validated = audienceSchema.parse(data);

    const result = await db.update(audiences)
      .set({
        name: validated.name,
        description: validated.description || null,
        interests: validated.interests,
        problems: validated.problems,
        platformAffinity: validated.platformAffinity,
        updatedAt: new Date(),
      })
      .where(and(eq(audiences.id, id), eq(audiences.userId, session.user.id)))
      .returning({ id: audiences.id });

    if (result.length === 0) return { success: false, error: "Not found or unauthorized" };

    revalidatePath("/settings/audiences");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update audience." };
  }
}

export async function deleteAudience(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized." };

    const result = await db.delete(audiences)
      .where(and(eq(audiences.id, id), eq(audiences.userId, session.user.id)))
      .returning({ id: audiences.id });
      
    if (result.length === 0) return { success: false, error: "Not found or unauthorized" };

    revalidatePath("/settings/audiences");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete audience." };
  }
}

export async function deleteAccount() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized." };

    const userId = session.user.id;

    // Delete the user from the users table.
    // Foreign key constraints cascade onDelete: 'cascade' across:
    // - distributionProfiles
    // - audiences
    // - contentSources (cascades to intelligence, ideas, plans, strategies, assets, queue items, outcomes)
    // - distributionPlans
    // - distributionAssets
    // - distributionQueueItems
    // - distributionOutcomes
    // - sessions
    // - accounts
    await db.delete(users).where(eq(users.id, userId));

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete account.",
    };
  }
}

