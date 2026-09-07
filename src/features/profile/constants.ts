export const DISTRIBUTION_GOALS = [
  { id: "REACH", name: "Reach", description: "Maximize the number of people who see the content." },
  { id: "PROFILE_DISCOVERY", name: "Profile Discovery", description: "Increase visits and awareness of your personal profile." },
  { id: "CREDIBILITY", name: "Credibility", description: "Establish authority and expertise in a specific domain." },
  { id: "NETWORK_GROWTH", name: "Network Growth", description: "Gain relevant followers or connections." },
  { id: "PROJECT_DISCOVERY", name: "Project Discovery", description: "Drive awareness to a specific project or product." },
  { id: "HIRING", name: "Hiring", description: "Attract potential candidates for open roles." },
  { id: "COLLABORATION", name: "Collaboration", description: "Find partners, contributors, or co-founders." },
  { id: "TRAFFIC", name: "Traffic", description: "Drive clicks to external websites or articles." },
  { id: "COMMUNITY", name: "Community", description: "Engage and nurture an existing audience or community." },
  { id: "LEADS", name: "Leads", description: "Generate business inquiries or sales leads." },
] as const;

export type DistributionGoalId = typeof DISTRIBUTION_GOALS[number]["id"];

import type { PlatformId } from "@/features/platforms/types";

export const PREFERRED_PLATFORMS: PlatformId[] = [
  "x",
  "linkedin",
  "peerlist",
  "github",
  "reddit",
  "blog",
  "portfolio"
];

export const PROMOTION_TOLERANCES = [
  "LOW",
  "MEDIUM",
  "HIGH"
] as const;

export function isAutoAnalyzeEnabled(profile?: { contentPreferences?: string[] | null } | null): boolean {
  return Array.isArray(profile?.contentPreferences) && profile.contentPreferences.includes("auto_analyze");
}

export function isAutoGeneratePlanEnabled(profile?: { contentPreferences?: string[] | null } | null): boolean {
  return Array.isArray(profile?.contentPreferences) && profile.contentPreferences.includes("auto_generate_plan");
}
