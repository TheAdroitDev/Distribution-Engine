import { getCachedSession } from "@/lib/auth/session";
import { LandingPageClient } from "@/components/landing/LandingPageClient";

export default async function LandingPage() {
  const session = await getCachedSession();
  return <LandingPageClient user={session?.user ?? null} />;
}

