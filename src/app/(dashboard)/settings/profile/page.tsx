import { db } from "@/lib/db";
import { distributionProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import type { ProfileInput } from "@/features/profile/validation";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

import { DeleteAccountSection } from "@/features/profile/components/DeleteAccountSection";

export default async function ProfileSettingsPage() {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;

  const profile = await db.query.distributionProfiles.findFirst({
    where: eq(distributionProfiles.userId, session.user.id)
  });

  const initialData: Partial<ProfileInput> | undefined = profile ? {
    expertise: profile.expertise ?? [],
    topics: profile.topics ?? [],
    preferredPlatforms: profile.preferredPlatforms ?? [],
    primaryGoal: profile.primaryGoal,
    secondaryGoals: profile.secondaryGoals ?? [],
    promotionTolerance: profile.promotionTolerance as ProfileInput["promotionTolerance"],
    voicePreferences: profile.voicePreferences as ProfileInput["voicePreferences"],
    contentPreferences: profile.contentPreferences ?? [],
    autoAnalyze: Array.isArray(profile.contentPreferences) && profile.contentPreferences.includes("auto_analyze"),
    autoGeneratePlan: Array.isArray(profile.contentPreferences) && profile.contentPreferences.includes("auto_generate_plan"),
  } : undefined;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/settings/profile" className="font-bold border-b-2 border-primary pb-1">Profile</Link>
        <Link href="/settings/audiences" className="text-muted-foreground pb-1">Audiences</Link>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Distribution Profile</h2>
        <p className="text-muted-foreground mt-1 mb-6">
          Define your expertise, tone, and platform preferences.
        </p>
        
        <ProfileForm initialData={initialData} />
      </div>

      <div className="pt-6 border-t space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Appearance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose between light and dark mode for your workspace.
          </p>
        </div>
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl border bg-muted/20">
          <div className="space-y-1">
            <div className="font-semibold text-base text-foreground">Theme Mode</div>
            <div className="text-sm text-muted-foreground">Toggle between light and dark theme.</div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <DeleteAccountSection />
    </div>
  );
}
