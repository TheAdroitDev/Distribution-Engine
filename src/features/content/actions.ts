"use server";

import { db } from "@/lib/db";
import { contentSources, distributionProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { contentSourceSchema } from "./validation";
import { analyzeContentSource } from "@/features/content-intelligence/actions";
import { createDistributionPlan } from "@/features/distribution/actions";

export async function createContentSource(
  formData: FormData,
  options?: { autoAnalyze?: boolean; autoGeneratePlan?: boolean }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const data = contentSourceSchema.parse({
      title: formData.get("title"),
      type: formData.get("type"),
      rawContent: formData.get("rawContent"),
    });

    const [inserted] = await db.insert(contentSources).values({
      userId: session.user.id,
      title: data.title,
      type: data.type,
      rawContent: data.rawContent,
    }).returning();

    // Determine auto-analysis and auto-plan settings
    let shouldAnalyze = options?.autoAnalyze;
    let shouldGeneratePlan = options?.autoGeneratePlan;

    if (shouldAnalyze === undefined || shouldGeneratePlan === undefined) {
      const profile = await db.query.distributionProfiles.findFirst({
        where: eq(distributionProfiles.userId, session.user.id),
      });
      if (shouldAnalyze === undefined) {
        shouldAnalyze = Array.isArray(profile?.contentPreferences) && profile.contentPreferences.includes("auto_analyze");
      }
      if (shouldGeneratePlan === undefined) {
        shouldGeneratePlan = Array.isArray(profile?.contentPreferences) && profile.contentPreferences.includes("auto_generate_plan");
      }
    }

    let analyzed = false;
    let planCreated = false;

    if (shouldAnalyze) {
      const analyzeResult = await analyzeContentSource(inserted.id);
      if (analyzeResult.success) {
        analyzed = true;
        if (shouldGeneratePlan) {
          const planResult = await createDistributionPlan(inserted.id);
          if (planResult.success) {
            planCreated = true;
          }
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/content");

    return {
      success: true,
      id: inserted.id,
      analyzed,
      planCreated,
    };
  } catch (error) {
    console.error("Error creating content source:", error);
    return { success: false, error: "Failed to create content source." };
  }
}

export async function deleteContentSource(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const result = await db
      .delete(contentSources)
      .where(and(eq(contentSources.id, id), eq(contentSources.userId, session.user.id)))
      .returning({ id: contentSources.id });

    if (result.length === 0) {
      return { success: false, error: "Content source not found or unauthorized." };
    }

    revalidatePath("/");
    revalidatePath("/content");
    revalidatePath("/plans");
    revalidatePath("/queue");
    revalidatePath("/outcomes");

    return { success: true };
  } catch (error) {
    console.error("Error deleting content source:", error);
    return { success: false, error: "Failed to delete content source." };
  }
}
