import type { FinalScoredCandidate } from "../schemas/strategy-schema";

export const MAX_PLAN_STRATEGIES = 7;

export type DiversityWeights = {
  samePlatformPenalty: number;
  sameIdeaPenalty: number;
  sameAudiencePenalty: number;
  sameFormatPenalty: number;
};

export const DEFAULT_DIVERSITY_WEIGHTS: DiversityWeights = {
  samePlatformPenalty: 12,
  sameIdeaPenalty: 6,
  sameAudiencePenalty: 3,
  sameFormatPenalty: 3,
};

// Deterministically selects the best candidates for a plan while applying diminishing returns
// for redundancy (same platform, idea, audience, format) against already selected candidates.
export function rerankForPlanDiversity(
  candidates: FinalScoredCandidate[], 
  maxStrategies = MAX_PLAN_STRATEGIES,
  weights = DEFAULT_DIVERSITY_WEIGHTS
): FinalScoredCandidate[] {
  const available = [...candidates];
  const selected: FinalScoredCandidate[] = [];

  while (selected.length < maxStrategies && available.length > 0) {
    let bestIndex = -1;
    let highestValue = -Infinity;

    for (let i = 0; i < available.length; i++) {
      const candidate = available[i];
      let selectionValue = candidate.finalScore;

      for (const s of selected) {
        if (s.platformId === candidate.platformId) {
          selectionValue -= weights.samePlatformPenalty;
        }
        if (s.contentIdeaId === candidate.contentIdeaId) {
          selectionValue -= weights.sameIdeaPenalty;
        }
        if (s.audienceId === candidate.audienceId) {
          selectionValue -= weights.sameAudiencePenalty;
        }
        if (s.formatId === candidate.formatId) {
          selectionValue -= weights.sameFormatPenalty;
        }
      }

      if (selectionValue > highestValue) {
        highestValue = selectionValue;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      selected.push(available[bestIndex]);
      available.splice(bestIndex, 1);
    } else {
      break;
    }
  }

  return selected;
}
