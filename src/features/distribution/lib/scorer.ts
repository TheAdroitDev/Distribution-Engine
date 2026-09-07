import { PLATFORMS } from "@/features/platforms/definitions";
import type { StrategyCandidate, ScoredCandidate } from "../schemas/strategy-schema";

export type ScorerInput = {
  candidates: StrategyCandidate[];
  profile: {
    preferredPlatforms: string[];
  };
  audiences: { id: string, platformAffinity: string[] }[];
  primaryGoalId: string;
  ideas: { id: string; title: string; angle: string }[];
  intelligence: { topics: string[]; technicalConcepts: string[] };
};

export function scoreCandidates(input: ScorerInput): ScoredCandidate[] {
  return input.candidates.map(candidate => {
    const platform = PLATFORMS[candidate.platformId];
    
    // Find the audience and idea for this candidate
    const audience = input.audiences.find(a => a.id === candidate.audienceId);
    const idea = input.ideas.find(i => i.id === candidate.contentIdeaId);

    // 1. Goal Fit (0 to 1) - Baseline from platform definition
    const goalAffinityValue = platform.goalAffinity[candidate.goalId as keyof typeof platform.goalAffinity] || 0;
    const goalFit = goalAffinityValue * 20; // weight: 20

    // 2. Preference Fit (Bonus if platform is in user's preferred platforms)
    const isPreferred = input.profile.preferredPlatforms.includes(candidate.platformId);
    const preferenceFit = isPreferred ? 15 : 0; // weight: 15

    // 3. Audience Fit (Bonus if platform is in audience's platform affinity)
    // Note: We gracefully handle case insensitivity / matching canonical IDs just in case.
    const audienceLikesPlatform = audience?.platformAffinity.some(p => p.toLowerCase() === candidate.platformId.toLowerCase());
    const audienceFit = audienceLikesPlatform ? 15 : 0; // weight: 15

    // 4. Platform Fit (Base heuristic for format/action common pairings)
    const platformFit = 10; 

    // 5. Strategic Strength (Bonus based on platform's documented strengths volume, rough proxy)
    const strategicStrength = platform.strategyRules.strengths.length > 0 ? 5 : 0;

    // 6. Weak Use Case Penalty (Deterministic baseline)
    const weakUseCasePenalty = 0;

    // 7. Effort Penalty (Formats like 'case_study' or 'deep_dive' take more effort than 'short_post')
    let effortPenalty = 0;
    if (['case_study', 'deep_dive', 'article', 'tutorial', 'documentation'].includes(candidate.formatId)) {
      effortPenalty = 10;
    }

    // 8. Content Fit (Deterministic baseline)
    // We implement a bounded, explainable keyword match between the content structure and platform definitions.
    let contentFit = 0;
    if (idea) {
      const platformText = `${platform.purpose} ${platform.strategyRules.strengths.join(" ")} ${platform.strategyRules.bestFor.join(" ")}`.toLowerCase();
      
      // Check if intelligence topics overlap with platform purpose/strengths
      const matchingTopics = input.intelligence.topics.filter(t => platformText.includes(t.toLowerCase()));
      if (matchingTopics.length > 0) contentFit += 5;

      // Check if intelligence technical concepts overlap
      const matchingConcepts = input.intelligence.technicalConcepts.filter(t => platformText.includes(t.toLowerCase()));
      if (matchingConcepts.length > 0) contentFit += 5;
      
      // Cap deterministic contentFit at 10 pts
      contentFit = Math.min(contentFit, 10);
    }

    // Calculate baseline score
    const baselineScore = 
      contentFit + 
      audienceFit + 
      goalFit + 
      platformFit + 
      preferenceFit + 
      strategicStrength - 
      weakUseCasePenalty - 
      effortPenalty;

    return {
      ...candidate,
      contentFit,
      audienceFit,
      goalFit,
      platformFit,
      preferenceFit,
      strategicStrength,
      weakUseCasePenalty,
      effortPenalty,
      baselineScore,
    };
  });
}
