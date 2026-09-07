import { getPlatformDefinitions } from "@/features/platforms/definitions";
import type { StrategyCandidate } from "../schemas/strategy-schema";

export type CandidateGeneratorInput = {
  contentIdeas: { id: string }[];
  audiences: { id: string, platformAffinity: string[] }[];
  primaryGoalId: string;
};

export function generateCandidates(input: CandidateGeneratorInput): StrategyCandidate[] {
  const platforms = getPlatformDefinitions();
  const candidates: StrategyCandidate[] = [];
  
  let counter = 0;

  for (const idea of input.contentIdeas) {
    for (const audience of input.audiences) {
      // For V1, we only generate candidates for the primary goal
      const goalId = input.primaryGoalId;
      
      for (const platform of platforms) {
        // Hard constraint: Only structurally valid format + action combinations are considered
        for (const combination of platform.validCombinations) {
          // Generate deterministic ephemeral ID
          const id = `cand-${counter++}`;
          
          candidates.push({
            id,
            contentIdeaId: idea.id,
            audienceId: audience.id,
            goalId,
            platformId: platform.id,
            formatId: combination.formatId,
            actionId: combination.actionId,
          });
        }
      }
    }
  }

  return candidates;
}
