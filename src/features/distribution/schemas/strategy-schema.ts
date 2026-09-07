import { z } from "zod";

export const aiStrategyRecommendationSchema = z.object({
  candidateId: z.string(), // We will assign deterministic IDs to candidates before AI evaluation
  semanticFit: z.number().min(0).max(1),
  rationale: z.string(),
  angle: z.string(),
  confidence: z.number().min(0).max(1),
});

export const aiStrategyResponseSchema = z.object({
  recommendations: z.array(aiStrategyRecommendationSchema),
});

export type AiStrategyRecommendation = z.infer<typeof aiStrategyRecommendationSchema>;
export type AiStrategyResponse = z.infer<typeof aiStrategyResponseSchema>;

// Internal domain types (Not purely DB tied, for the engine)
export type StrategyCandidate = {
  id: string; // generated ephemeral ID for candidate ranking
  contentIdeaId: string;
  audienceId: string;
  goalId: string;
  platformId: string;
  formatId: string;
  actionId: string;
};

export type ScoredCandidate = StrategyCandidate & {
  // deterministic components
  contentFit: number;
  audienceFit: number;
  goalFit: number;
  platformFit: number;
  preferenceFit: number;
  strategicStrength: number;
  weakUseCasePenalty: number;
  effortPenalty: number;
  baselineScore: number;
};

export type FinalScoredCandidate = ScoredCandidate & {
  semanticFit: number;
  rationale: string;
  angle: string;
  confidence: number;
  finalScore: number;
};
