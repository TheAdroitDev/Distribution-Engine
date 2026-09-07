/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi } from 'vitest';
import { runStrategyEngine } from './strategy-engine';
import { generateCandidates } from './candidate-generator';
import { scoreCandidates } from './scorer';
import { evaluateStrategiesWithAi } from './ai';

vi.mock('./candidate-generator', () => ({
  generateCandidates: vi.fn()
}));

vi.mock('./scorer', () => ({
  scoreCandidates: vi.fn()
}));

vi.mock('./ai', () => ({
  evaluateStrategiesWithAi: vi.fn()
}));

describe('Strategy Engine Stratified Selection', () => {
  it('selects candidates from multiple platforms avoiding monopoly', async () => {
    // 6 Peerlist candidates (very high score), 4 X candidates (medium score), 4 LinkedIn candidates (low score)
    const rawCandidates: any[] = [];
    const mockScoredCandidates: any[] = [];
    
    for (let i = 0; i < 6; i++) {
      mockScoredCandidates.push({ id: `p${i}`, platformId: 'peerlist', baselineScore: 90 - i });
    }
    for (let i = 0; i < 4; i++) {
      mockScoredCandidates.push({ id: `x${i}`, platformId: 'x', baselineScore: 60 - i });
    }
    for (let i = 0; i < 4; i++) {
      mockScoredCandidates.push({ id: `l${i}`, platformId: 'linkedin', baselineScore: 50 - i });
    }

    vi.mocked(generateCandidates).mockReturnValue(rawCandidates);
    vi.mocked(scoreCandidates).mockReturnValue(mockScoredCandidates);
    vi.mocked(evaluateStrategiesWithAi).mockResolvedValue([]);

    const result = await runStrategyEngine({
      contentSource: { id: 's1', title: 't1', rawContent: 'c' },
      intelligence: { summary: 's', coreThesis: null, topics: [], technicalConcepts: [] },
      ideas: [{ id: 'i1', title: 'i', summary: 's', angle: 'a' }],
      profile: { expertise: [], topics: [], preferredPlatforms: [], primaryGoal: 'g1' },
      audiences: []
    });

    // The AI should have received exactly 3 from Peerlist, 3 from X, 3 from LinkedIn
    const aiArgs = vi.mocked(evaluateStrategiesWithAi).mock.calls[0][0];
    const aiCandidates = aiArgs.candidates;
    
    const peerlistCount = aiCandidates.filter((c: any) => c.platformId === 'peerlist').length;
    const xCount = aiCandidates.filter((c: any) => c.platformId === 'x').length;
    const linkedInCount = aiCandidates.filter((c: any) => c.platformId === 'linkedin').length;

    expect(peerlistCount).toBe(3); // bounded by MAX_AI_CANDIDATES_PER_PLATFORM
    expect(xCount).toBe(3);
    expect(linkedInCount).toBe(3);
  });
});
