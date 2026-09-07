import { db } from "@/lib/db";
import { distributionProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import { ContentForm } from "@/features/content/components/ContentForm";

export default async function NewContentPage() {
  const session = await getCachedSession();
  const profile = session?.user?.id
    ? await db.query.distributionProfiles.findFirst({
        where: eq(distributionProfiles.userId, session.user.id),
      })
    : null;

  const defaultAutoAnalyze = Array.isArray(profile?.contentPreferences) && profile.contentPreferences.includes("auto_analyze");
  const defaultAutoGeneratePlan = Array.isArray(profile?.contentPreferences) && profile.contentPreferences.includes("auto_generate_plan");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Something to Distribute</h1>
        <p className="text-muted-foreground mt-1">
          Paste your raw text or markdown to begin the distribution process.
        </p>
      </div>
      <ContentForm
        initialAutoAnalyze={defaultAutoAnalyze}
        initialAutoGeneratePlan={defaultAutoGeneratePlan}
      />
    </div>
  );
}
