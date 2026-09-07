import { z } from "zod";
import { PROMOTION_TOLERANCES } from "./constants";

export const voicePreferencesSchema = z.object({
  tone: z.string().optional(),
  verbosity: z.string().optional(),
  technicality: z.string().optional(),
  formality: z.string().optional(),
  opinionatedness: z.string().optional(),
});

export const profileSchema = z.object({
  expertise: z.array(z.string()).catch([]),
  topics: z.array(z.string()).catch([]),
  preferredPlatforms: z.array(z.string()).catch([]),
  primaryGoal: z.string().optional().nullable(),
  secondaryGoals: z.array(z.string()).catch([]),
  voicePreferences: voicePreferencesSchema.optional().nullable(),
  promotionTolerance: z.enum(PROMOTION_TOLERANCES).optional().nullable(),
  contentPreferences: z.array(z.string()).catch([]),
  autoAnalyze: z.boolean().optional(),
  autoGeneratePlan: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const audienceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  interests: z.array(z.string()).catch([]),
  problems: z.array(z.string()).catch([]),
  platformAffinity: z.array(z.string()).catch([]),
});

export type AudienceInput = z.infer<typeof audienceSchema>;
