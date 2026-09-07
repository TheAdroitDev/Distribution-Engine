import { describe, it, expect } from 'vitest';
import { scoreCandidates } from './scorer';
import type { StrategyCandidate } from '../schemas/strategy-schema';

describe('scoreCandidates', () => {
  it('calculates deterministic contentFit based on topic and concept overlap', () => {
    const candidates: StrategyCandidate[] = [{
      id: 'c1',
      platformId: 'github',
      audienceId: 'a1',
      contentIdeaId: 'i1',
      goalId: 'PROJECT_DISCOVERY',
      formatId: 'readme',
      actionId: 'update_readme'
    }];

    // GitHub's purpose/strengths includes "documentation", "architecture", "open source"
    const result = scoreCandidates({
      candidates,
      profile: { preferredPlatforms: [] },
      audiences: [{ id: 'a1', platformAffinity: [] }],
      primaryGoalId: 'PROJECT_DISCOVERY',
      ideas: [{ id: 'i1', title: 'Open Source Architecture', angle: 'How to build it' }],
      intelligence: {
        topics: ['Open source', 'Architecture'],
        technicalConcepts: ['Architecture']
      }
    });

    // topics match "architecture" and "open source" (+5)
    // technicalConcepts match "architecture" (+5)
    // total contentFit should be 10 (capped)
    expect(result[0].contentFit).toBe(10);
  });

  it('contentFit is bounded and deterministic for non-matching topics', () => {
    const candidates: StrategyCandidate[] = [{
      id: 'c1',
      platformId: 'github',
      audienceId: 'a1',
      contentIdeaId: 'i1',
      goalId: 'PROJECT_DISCOVERY',
      formatId: 'readme',
      actionId: 'update_readme'
    }];

    const result = scoreCandidates({
      candidates,
      profile: { preferredPlatforms: [] },
      audiences: [{ id: 'a1', platformAffinity: [] }],
      primaryGoalId: 'PROJECT_DISCOVERY',
      ideas: [{ id: 'i1', title: 'Marketing 101', angle: 'Sales' }],
      intelligence: {
        topics: ['Sales', 'Marketing'],
        technicalConcepts: ['Funnel']
      }
    });

    expect(result[0].contentFit).toBe(0);
  });
});
