import { describe, it, expect } from 'vitest';
import { rerankForPlanDiversity } from './diversity';
import type { FinalScoredCandidate } from '../schemas/strategy-schema';

function makeCandidate(id: string, platformId: string, finalScore: number, ideaId = 'idea1', audId = 'aud1', formatId = 'fmt1'): FinalScoredCandidate {
  return {
    id,
    platformId,
    finalScore,
    contentIdeaId: ideaId,
    audienceId: audId,
    formatId,
    actionId: 'action1',
    goalId: 'goal1',
    baselineScore: 50,
    semanticFit: 0.5,
    rationale: '',
    angle: '',
    confidence: 0.8,
    contentFit: 0,
    audienceFit: 10,
    goalFit: 10,
    platformFit: 10,
    preferenceFit: 0,
    strategicStrength: 5,
    weakUseCasePenalty: 0,
    effortPenalty: 0
  };
}

describe('rerankForPlanDiversity', () => {
  it('selects candidates with highest scores if no redundancy', () => {
    const candidates = [
      makeCandidate('c1', 'peerlist', 65, 'idea1'),
      makeCandidate('c2', 'x', 64, 'idea2'),
      makeCandidate('c3', 'linkedin', 63, 'idea3'),
    ];

    const result = rerankForPlanDiversity(candidates, 3);
    expect(result.length).toBe(3);
    expect(result.map(c => c.id)).toEqual(['c1', 'c2', 'c3']);
  });

  it('applies diminishing returns for same platform', () => {
    const candidates = [
      makeCandidate('c1', 'peerlist', 65, 'idea1'),
      makeCandidate('c2', 'peerlist', 64, 'idea2'), // penalty: -12 = 52
      makeCandidate('c3', 'peerlist', 63, 'idea3'), // penalty: -12 = 51
      makeCandidate('c4', 'peerlist', 62, 'idea4'), // penalty: -12 = 50
      makeCandidate('c5', 'x', 63, 'idea5'),
      makeCandidate('c6', 'linkedin', 62, 'idea6'),
    ];

    // c1 (65) is selected first.
    // c5 (63) is selected second (c2 is now 52).
    // c6 (62) is selected third.
    // c2 (52) is selected fourth.
    const result = rerankForPlanDiversity(candidates, 4);
    expect(result.map(c => c.id)).toEqual(['c1', 'c5', 'c6', 'c2']);
  });

  it('penalizes same idea more than different idea', () => {
    const candidates = [
      makeCandidate('c1', 'peerlist', 65, 'idea1'),
      // Same platform AND same idea: penalty = -12 + -6 = -18
      makeCandidate('c2', 'peerlist', 64, 'idea1'), // effective: 46
      // Same platform but different idea: penalty = -12
      makeCandidate('c3', 'peerlist', 63, 'idea2'), // effective: 51
    ];

    const result = rerankForPlanDiversity(candidates, 3);
    // c1 is first. Then c3 (51) should beat c2 (46).
    expect(result.map(c => c.id)).toEqual(['c1', 'c3', 'c2']);
  });

  it('preserves final plan size', () => {
    const candidates = Array.from({ length: 15 }, (_, i) => 
      makeCandidate(`c${i}`, `plat${i}`, 50 - i)
    );
    const result = rerankForPlanDiversity(candidates, 7);
    expect(result.length).toBe(7);
  });
});
