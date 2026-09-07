import { generateCandidates } from "./candidate-generator";
import { scoreCandidates } from "./scorer";
import { evaluateStrategiesWithAi } from "./ai";
import { PLATFORMS } from "@/features/platforms/definitions";
import { rerankForPlanDiversity } from "./diversity";
import type { FinalScoredCandidate, ScoredCandidate } from "../schemas/strategy-schema";

export const MAX_AI_STRATEGY_CANDIDATES = 12;
export const MAX_AI_CANDIDATES_PER_PLATFORM = 3;

export type EngineInput = {
  contentSource: { id: string; title: string; rawContent: string; };
  intelligence: { summary: string; coreThesis: string | null; topics: string[]; technicalConcepts: string[]; };
  ideas: { id: string; title: string; summary: string; angle: string; }[];
  profile: { expertise: string[]; topics: string[]; preferredPlatforms: string[]; primaryGoal: string; };
  audiences: { id: string; name: string; description: string | null; platformAffinity: string[]; }[];
};

export async function runStrategyEngine(input: EngineInput): Promise<FinalScoredCandidate[]> {
  // 1. Generate combinations
  const rawCandidates = generateCandidates({
    contentIdeas: input.ideas,
    audiences: input.audiences,
    primaryGoalId: input.profile.primaryGoal,
  });

  // 2. Baseline deterministic scoring
  const scoredCandidates = scoreCandidates({
    candidates: rawCandidates,
    profile: input.profile,
    audiences: input.audiences,
    primaryGoalId: input.profile.primaryGoal,
    ideas: input.ideas,
    intelligence: input.intelligence,
  });

  // 3. Stratified Candidate Selection for AI
  const groupedByPlatform: Record<string, ScoredCandidate[]> = {};
  for (const candidate of scoredCandidates) {
    if (!groupedByPlatform[candidate.platformId]) {
      groupedByPlatform[candidate.platformId] = [];
    }
    groupedByPlatform[candidate.platformId].push(candidate);
  }

  const stratifiedCandidates: ScoredCandidate[] = [];
  for (const platformId in groupedByPlatform) {
    const platformCandidates = groupedByPlatform[platformId];
    // Sort descending by baseline score within the platform
    platformCandidates.sort((a, b) => b.baselineScore - a.baselineScore);
    // Take the top representatives
    stratifiedCandidates.push(...platformCandidates.slice(0, MAX_AI_CANDIDATES_PER_PLATFORM));
  }

  // Final global sort and bound to ensure we stay within AI budget
  stratifiedCandidates.sort((a, b) => b.baselineScore - a.baselineScore);
  const topCandidates = stratifiedCandidates.slice(0, MAX_AI_STRATEGY_CANDIDATES);

  // 4. Send bounded list to AI for semantic evaluation
  const aiRecommendations = await evaluateStrategiesWithAi({
    candidates: topCandidates,
    context: {
      contentSource: input.contentSource,
      intelligence: input.intelligence,
      ideas: input.ideas,
      profile: input.profile,
      audiences: input.audiences,
      platforms: PLATFORMS,
    }
  });

  // 5. Deterministic final score combination
  const finalStrategies = topCandidates.map(candidate => {
    // Find AI evaluation if it exists
    const aiEval = aiRecommendations.find(r => r.candidateId === candidate.id);
    
    // AI semantic fit is 0..1, we multiply by 40 to give it a significant but bounded weight (max 40 pts).
    const semanticFitScore = aiEval ? (aiEval.semanticFit * 40) : 0;
    
    const finalScore = candidate.baselineScore + semanticFitScore;

    return {
      ...candidate,
      semanticFit: aiEval?.semanticFit || 0,
      rationale: aiEval?.rationale || "Strong deterministic fit.",
      angle: aiEval?.angle || "Focus on the core thesis.",
      confidence: aiEval?.confidence || 0,
      finalScore: Math.round(finalScore)
    };
  });

  // 6. Final Ranking & Diversification
  return rerankForPlanDiversity(finalStrategies);
}
