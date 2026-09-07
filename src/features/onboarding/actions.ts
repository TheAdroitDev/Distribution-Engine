"use server";

import { db } from "@/lib/db";
import { audiences, distributionProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { INBUILT_AUDIENCE_PRESETS } from "./constants";

export interface OnboardingSubmission {
  selectedAudienceIds: string[];
  primaryGoal: string;
  preferredPlatforms: string[];
  promotionTolerance: "LOW" | "MEDIUM" | "HIGH";
  automations: string[];
}

export async function submitOnboardingQuestionnaire(data: OnboardingSubmission) {
  try {
    const session = await getCachedSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }
    const userId = session.user.id;

    // 1. Insert selected inbuilt audiences into user's audiences table
    if (data.selectedAudienceIds.length > 0) {
      const existingAudiences = await db.query.audiences.findMany({
        where: eq(audiences.userId, userId),
        columns: { name: true },
      });
      const existingNames = new Set(existingAudiences.map((a) => a.name));

      const audiencesToInsert = INBUILT_AUDIENCE_PRESETS.filter(
        (preset) =>
          data.selectedAudienceIds.includes(preset.id) &&
          !existingNames.has(preset.name)
      ).map((preset) => ({
        userId,
        name: preset.name,
        description: preset.description,
        interests: preset.interests,
        problems: preset.problems,
        platformAffinity: preset.platformAffinity,
      }));

      if (audiencesToInsert.length > 0) {
        await db.insert(audiences).values(audiencesToInsert);
      }
    }

    // 2. Upsert distribution profile with preferences and onboarding_completed flag
    const existingProfile = await db.query.distributionProfiles.findFirst({
      where: eq(distributionProfiles.userId, userId),
    });

    const existingPrefs = new Set(existingProfile?.contentPreferences || []);
    existingPrefs.add("onboarding_completed");

    // Apply automations
    if (data.automations.includes("auto_analyze")) {
      existingPrefs.add("auto_analyze");
    } else {
      existingPrefs.delete("auto_analyze");
    }

    if (data.automations.includes("auto_generate_plan")) {
      existingPrefs.add("auto_generate_plan");
    } else {
      existingPrefs.delete("auto_generate_plan");
    }

    const profileData = {
      primaryGoal: data.primaryGoal || existingProfile?.primaryGoal || "AUTHORITY",
      preferredPlatforms:
        data.preferredPlatforms.length > 0
          ? data.preferredPlatforms
          : existingProfile?.preferredPlatforms || ["TWITTER", "LINKEDIN"],
      promotionTolerance: data.promotionTolerance || existingProfile?.promotionTolerance || "MEDIUM",
      contentPreferences: Array.from(existingPrefs),
    };

    if (existingProfile) {
      await db
        .update(distributionProfiles)
        .set(profileData)
        .where(eq(distributionProfiles.userId, userId));
    } else {
      await db.insert(distributionProfiles).values({
        userId,
        ...profileData,
      });
    }

    revalidatePath("/");
    revalidatePath("/settings/profile");
    revalidatePath("/settings/audiences");

    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to submit onboarding questionnaire:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save questionnaire preferences.",
    };
  }
}

export async function skipOnboarding() {
  try {
    const session = await getCachedSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }
    const userId = session.user.id;

    const existingProfile = await db.query.distributionProfiles.findFirst({
      where: eq(distributionProfiles.userId, userId),
    });

    const existingPrefs = new Set(existingProfile?.contentPreferences || []);
    existingPrefs.add("onboarding_completed");

    if (existingProfile) {
      await db
        .update(distributionProfiles)
        .set({ contentPreferences: Array.from(existingPrefs) })
        .where(eq(distributionProfiles.userId, userId));
    } else {
      await db.insert(distributionProfiles).values({
        userId,
        contentPreferences: Array.from(existingPrefs),
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to skip onboarding:", error);
    return { success: false, error: "Failed to skip onboarding." };
  }
}
