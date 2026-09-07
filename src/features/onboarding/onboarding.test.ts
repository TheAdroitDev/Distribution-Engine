import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitOnboardingQuestionnaire, skipOnboarding } from "./actions";
import { INBUILT_AUDIENCE_PRESETS, ONBOARDING_GOALS, ONBOARDING_PLATFORMS } from "./constants";

vi.mock("@/lib/auth/session", () => ({
  getCachedSession: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  return {
    db: {
      query: {
        audiences: {
          findMany: vi.fn(),
        },
        distributionProfiles: {
          findFirst: vi.fn(),
        },
      },
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue({ rowCount: 1 }),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn().mockResolvedValue({ rowCount: 1 }),
      })),
    },
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Onboarding Questionnaire", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Constants", () => {
    it("has all required inbuilt audience presets", () => {
      expect(INBUILT_AUDIENCE_PRESETS.length).toBeGreaterThanOrEqual(5);
      const ids = INBUILT_AUDIENCE_PRESETS.map((p) => p.id);
      expect(ids).toContain("nextjs_engineers");
      expect(ids).toContain("ai_engineers");
      expect(ids).toContain("indie_builders");
    });

    it("has valid distribution goals", () => {
      expect(ONBOARDING_GOALS.length).toBe(4);
      const goalIds = ONBOARDING_GOALS.map((g) => g.id);
      expect(goalIds).toContain("AUTHORITY");
      expect(goalIds).toContain("LEAD_GEN");
    });

    it("has supported distribution platforms", () => {
      expect(ONBOARDING_PLATFORMS.length).toBeGreaterThanOrEqual(5);
      const platformIds = ONBOARDING_PLATFORMS.map((p) => p.id);
      expect(platformIds).toContain("x");
      expect(platformIds).toContain("linkedin");
    });
  });

  describe("Actions", () => {
    it("returns unauthorized when session is missing", async () => {
      const { getCachedSession } = await import("@/lib/auth/session");
      (getCachedSession as any).mockResolvedValue(null);

      const res = await submitOnboardingQuestionnaire({
        selectedAudienceIds: ["nextjs_engineers"],
        primaryGoal: "AUTHORITY",
        preferredPlatforms: ["TWITTER"],
        promotionTolerance: "MEDIUM",
        automations: ["auto_analyze"],
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Unauthorized.");
    });

    it("saves preferences and inserts audiences when authenticated", async () => {
      const { getCachedSession } = await import("@/lib/auth/session");
      (getCachedSession as any).mockResolvedValue({ user: { id: "user-123" } });

      const { db } = await import("@/lib/db");
      (db.query.audiences.findMany as any).mockResolvedValue([]);
      (db.query.distributionProfiles.findFirst as any).mockResolvedValue(null);

      const res = await submitOnboardingQuestionnaire({
        selectedAudienceIds: ["nextjs_engineers", "ai_engineers"],
        primaryGoal: "AUTHORITY",
        preferredPlatforms: ["TWITTER", "LINKEDIN"],
        promotionTolerance: "MEDIUM",
        automations: ["auto_analyze", "auto_generate_plan"],
      });

      expect(res.success).toBe(true);
      expect(db.insert).toHaveBeenCalledTimes(2); // once for audiences, once for profile
    });

    it("marks onboarding as completed on skip", async () => {
      const { getCachedSession } = await import("@/lib/auth/session");
      (getCachedSession as any).mockResolvedValue({ user: { id: "user-123" } });

      const { db } = await import("@/lib/db");
      (db.query.distributionProfiles.findFirst as any).mockResolvedValue({
        userId: "user-123",
        contentPreferences: [],
      });

      const res = await skipOnboarding();
      expect(res.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });
});
