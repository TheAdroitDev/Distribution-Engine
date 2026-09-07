import { z } from "zod";
import { PLATFORMS } from "./definitions";

// Simple validation to ensure our hardcoded dictionary conforms at runtime if needed,
// though TypeScript already enforces most of this.

export const platformIdSchema = z.enum(["x", "linkedin", "peerlist", "github", "reddit", "blog", "portfolio"]);

export const platformConstraintsSchema = z.object({
  maxTextLength: z.number().nullable().optional(),
  supportsLongForm: z.boolean(),
  supportsThreads: z.boolean(),
  supportsReplies: z.boolean(),
  supportsLinks: z.boolean(),
  supportsImages: z.boolean(),
  supportsVideo: z.boolean(),
  supportsCode: z.boolean(),
  supportsMarkdown: z.boolean(),
  supportsPersistentContent: z.boolean(),
  requiresCommunityContext: z.boolean(),
  promotionSensitivity: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export const platformStrategyRulesSchema = z.object({
  strengths: z.array(z.string()),
  weakUseCases: z.array(z.string()),
  bestFor: z.array(z.string()),
  avoid: z.array(z.string()),
});

export const platformDefinitionSchema = z.object({
  id: platformIdSchema,
  name: z.string(),
  purpose: z.string(),
  formats: z.array(z.string()),
  actions: z.array(z.string()),
  validCombinations: z.array(z.object({
    formatId: z.string(),
    actionId: z.string(),
  })),
  constraints: platformConstraintsSchema,
  strategyRules: platformStrategyRulesSchema,
  goalAffinity: z.record(z.string(), z.number().min(0).max(1)),
});

// Validate our static definitions immediately upon import
export const validatePlatformDefinitions = () => {
  return Object.values(PLATFORMS).map(p => platformDefinitionSchema.parse(p));
};
