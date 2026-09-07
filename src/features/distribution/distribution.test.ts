import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCandidates } from "./lib/candidate-generator";
import { scoreCandidates } from "./lib/scorer";
import { evaluateStrategiesWithAi } from "./lib/ai";
import { runStrategyEngine, MAX_AI_STRATEGY_CANDIDATES } from "./lib/strategy-engine";
import { PLATFORMS } from "@/features/platforms/definitions";

// Mock AI module to ensure independence from network availability
vi.mock("./lib/ai", () => ({
  evaluateStrategiesWithAi: vi.fn(async (input) => {
    return input.candidates.map((c: { id: string }) => ({
      candidateId: c.id,
      semanticFit: 0.9,
      rationale: "Mock rationale",
      angle: "Mock angle",
      confidence: 0.95
    }));
  })
}));

describe("Phase 5 - Candidate Generator", () => {
  const mockInput = {
    contentIdeas: [{ id: "idea1" }, { id: "idea2" }],
    audiences: [{ id: "aud1", platformAffinity: ["x"] }],
    primaryGoalId: "PROJECT_DISCOVERY"
  };

  it("should generate bounded valid candidates based on formats and actions", () => {
    const candidates = generateCandidates(mockInput);
    
    expect(candidates.length).toBeGreaterThan(0);
    
    const firstCand = candidates[0];
    expect(firstCand.contentIdeaId).toBeTruthy();
    expect(firstCand.audienceId).toBeTruthy();
    expect(firstCand.goalId).toBeTruthy();
    expect(firstCand.platformId).toBeTruthy();
    expect(firstCand.formatId).toBeTruthy();
    expect(firstCand.actionId).toBeTruthy();
  });

  it("never emits an invalid structurally incompatible format/action combination", () => {
    const candidates = generateCandidates(mockInput);
    
    for (const c of candidates) {
      const platformDef = PLATFORMS[c.platformId as keyof typeof PLATFORMS];
      const isValid = platformDef.validCombinations.some(
        vc => vc.formatId === c.formatId && vc.actionId === c.actionId
      );
      
      // Candidate must be perfectly structurally valid
      expect(isValid).toBe(true);
    }
  });

  it("should reject invalid combinations by never generating them (e.g. X + technical_opinion + update_project)", () => {
    const candidates = generateCandidates(mockInput);
    
    const badCandidate = candidates.find(
      c => c.platformId === "x" && c.formatId === "technical_opinion" && c.actionId === "update_project"
    );
    expect(badCandidate).toBeUndefined();
  });

  it("AI never needs to repair structurally invalid candidates because they never reach AI", async () => {
    const candidates = generateCandidates(mockInput);
    // Because the generator only emitted structurally valid candidates, 
    // AI evaluator inherently will never see an invalid candidate.
    expect(candidates.every(c => {
      const p = PLATFORMS[c.platformId as keyof typeof PLATFORMS];
      return p.validCombinations.some(vc => vc.formatId === c.formatId && vc.actionId === c.actionId);
    })).toBe(true);
  });
});

describe("Phase 5 - Deterministic Scorer", () => {
  it("should independently calculate reproducible score components", () => {
    const candidates = [
      { id: "1", contentIdeaId: "idea1", audienceId: "aud1", goalId: "LEAD_GENERATION", platformId: "linkedin", formatId: "professional_post", actionId: "publish" },
      { id: "2", contentIdeaId: "idea1", audienceId: "aud1", goalId: "LEAD_GENERATION", platformId: "reddit", formatId: "question", actionId: "create_discussion" }
    ];

    const input = {
      candidates,
      profile: { preferredPlatforms: ["linkedin"] }, // LinkedIn gets +15
      audiences: [{ id: "aud1", platformAffinity: ["linkedin"] }], // LinkedIn gets +15
      primaryGoalId: "LEAD_GENERATION",
      ideas: [{ id: "idea1", title: "Idea", angle: "Angle" }],
      intelligence: { topics: [], technicalConcepts: [] }
    };

    const scored = scoreCandidates(input);
    
    const linkedin = scored.find(s => s.platformId === "linkedin")!;
    const reddit = scored.find(s => s.platformId === "reddit")!;

    // LinkedIn should have higher preference and audience fit
    expect(linkedin.preferenceFit).toBe(15);
    expect(linkedin.audienceFit).toBe(15);

    expect(reddit.preferenceFit).toBe(0);
    expect(reddit.audienceFit).toBe(0);

    // Effort Penalty testing
    expect(linkedin.effortPenalty).toBe(0);
    
    const deepCandidate = [
      { id: "3", contentIdeaId: "idea1", audienceId: "aud1", goalId: "LEAD_GENERATION", platformId: "blog", formatId: "deep_dive", actionId: "publish" },
    ];
    const deepScored = scoreCandidates({ ...input, candidates: deepCandidate });
    expect(deepScored[0].effortPenalty).toBe(10);
  });
});

describe("Phase 5 - Strategy Engine Orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should orchestrate and bound AI candidates", async () => {
    const input = {
      contentSource: { id: "s1", title: "Test", rawContent: "Content" },
      intelligence: { summary: "Sum", coreThesis: null, topics: [], technicalConcepts: [] },
      ideas: [{ id: "idea1", title: "Idea 1", summary: "Summary", angle: "Angle" }],
      profile: { expertise: [], topics: [], preferredPlatforms: ["x", "linkedin"], primaryGoal: "PROJECT_DISCOVERY" },
      audiences: [{ id: "aud1", name: "Aud 1", description: null, platformAffinity: ["x"] }]
    };

    const finalStrategies = await runStrategyEngine(input);
    
    // Check bounding
    expect(evaluateStrategiesWithAi).toHaveBeenCalledTimes(1);
    const mockCalls = vi.mocked(evaluateStrategiesWithAi).mock.calls;
    expect(mockCalls[0][0].candidates.length).toBeLessThanOrEqual(MAX_AI_STRATEGY_CANDIDATES);
    
    // Check final score structure
    expect(finalStrategies.length).toBeLessThanOrEqual(MAX_AI_STRATEGY_CANDIDATES);
    expect(finalStrategies[0].semanticFit).toBe(0.9);
    expect(finalStrategies[0].finalScore).toBeGreaterThan(finalStrategies[0].baselineScore);
    
    // Check ranking
    expect(finalStrategies[0].finalScore).toBeGreaterThanOrEqual(finalStrategies[1].finalScore);
  });
});
