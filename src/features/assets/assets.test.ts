import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateValidatedAsset } from './lib/asset-generator';

vi.mock('./lib/ai', () => ({
  generatePlatformNativeAsset: vi.fn(),
}));

import { generatePlatformNativeAsset } from './lib/ai';

describe('Asset Generator (Phase 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseContext = {
    sourceTitle: "Test",
    sourceType: "TEXT",
    sourceRawContent: "Raw",
    intelligenceSummary: "Sum",
    intelligenceTopics: [],
    intelligenceConcepts: [],
    ideaTitle: "Idea",
    ideaSummary: "Sum",
    ideaAngle: "Angle",
    profileExpertise: [],
    profileVoice: {},
    profileContentPrefs: [],
    audienceName: "Audience",
    audienceContext: "Context",
    strategyPlatform: "X",
    strategyPlatformId: "x",
    strategyFormat: "short_post",
    strategyFormatId: "short_post",
    strategyAction: "publish",
    strategyAngle: "Angle",
    strategyRationale: "Rat",
    platformConstraints: { maxTextLength: 280, supportsLongForm: false },
    platformStrategyRules: {},
  };

  it('validates AI output against Zod schema and returns domain result', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: "This is a valid short post.",
    });

    const result = await generateValidatedAsset(baseContext);

    expect(result.formatId).toBe("short_post");
    expect(result.body).toBe("This is a valid short post.");
    expect(result.title).toBeNull();
  });

  it('rejects malformed AI output (missing body)', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: "Something",
      body: undefined as unknown as string, // simulating bad AI output
      metadata: { items: [] }
    });

    await expect(generateValidatedAsset(baseContext)).rejects.toThrow();
  });

  it('rejects AI output with empty body string', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: "Has a title",
      body: "",
    });

    await expect(generateValidatedAsset(baseContext)).rejects.toThrow(/Asset body must not be empty/);
  });

  it('applies deterministic platform constraint validation (maxTextLength on body)', async () => {
    const longString = "a".repeat(300);
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: longString, // Exceeds X's 280 maxTextLength
    });

    await expect(generateValidatedAsset(baseContext)).rejects.toThrow(
      /Deterministic Validation Failed: Body length \(300\) exceeds platform max allowed \(280\)/
    );
  });

  it('applies deterministic platform constraint validation (maxTextLength on thread items)', async () => {
    const longString = "a".repeat(300);
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: "Thread intro",
      metadata: { items: ["valid item", longString] } // Exceeds 280
    });

    await expect(generateValidatedAsset(baseContext)).rejects.toThrow(
      /Deterministic Validation Failed: Thread item length \(300\) exceeds platform max allowed \(280\)/
    );
  });
  
  it('enforces strategy consistency by mapping formatId', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: "My Title",
      body: "A valid post.",
    });

    const context = { ...baseContext, strategyFormatId: "technical_opinion" };
    const result = await generateValidatedAsset(context);
    expect(result.formatId).toBe("technical_opinion");
  });

  it('preserves populated title and body through the full validation pipeline', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: "Why Vertical Slice Architecture Works",
      body: "I chose Vertical Slice Architecture because it keeps each feature self-contained. Here is why...",
    });

    const peerlistContext = {
      ...baseContext,
      strategyPlatform: "Peerlist",
      strategyPlatformId: "peerlist",
      strategyFormat: "project_showcase",
      strategyFormatId: "project_showcase",
      strategyAction: "update_project",
      platformConstraints: { supportsLongForm: true, supportsThreads: false },
    };

    const result = await generateValidatedAsset(peerlistContext);

    expect(result.title).toBe("Why Vertical Slice Architecture Works");
    expect(result.body).toBe("I chose Vertical Slice Architecture because it keeps each feature self-contained. Here is why...");
    expect(result.formatId).toBe("project_showcase");
    expect(result.metadata).toBeUndefined();
  });

  it('does not produce thread-style metadata for non-thread platforms', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: "Project Showcase",
      body: "Full project showcase content goes here.",
      metadata: undefined, // Non-thread platforms should NOT populate items
    });

    const peerlistContext = {
      ...baseContext,
      strategyPlatform: "Peerlist",
      strategyPlatformId: "peerlist",
      strategyFormat: "project_showcase",
      strategyFormatId: "project_showcase",
      strategyAction: "update_project",
      platformConstraints: { supportsLongForm: true, supportsThreads: false },
    };

    const result = await generateValidatedAsset(peerlistContext);
    expect(result.body.length).toBeGreaterThan(0);
    expect(result.metadata).toBeUndefined();
  });

  it('enforces X technical_opinion rules: throws if > 280 chars', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: "a".repeat(281),
    });

    const context = { ...baseContext, strategyFormatId: "technical_opinion" };
    await expect(generateValidatedAsset(context)).rejects.toThrow(/X technical_opinion must be <= 280 chars/);
  });

  it('enforces X technical_opinion rules: throws if contains em dash', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: "This is a test—with an em dash.",
    });

    const context = { ...baseContext, strategyFormatId: "technical_opinion" };
    await expect(generateValidatedAsset(context)).rejects.toThrow(/X technical_opinion cannot contain an em dash/);
  });

  it('enforces X technical_opinion rules: scrubs thread metadata items', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: "Main body.",
      metadata: { items: ["thread item 1"] }
    });

    const context = { ...baseContext, strategyFormatId: "technical_opinion" };
    const result = await generateValidatedAsset(context);
    expect(result.metadata?.items).toEqual([]);
  });

  it('handles regeneration and throws if exact duplicate is produced twice', async () => {
    vi.mocked(generatePlatformNativeAsset).mockResolvedValue({
      title: null,
      body: "Same exact draft.",
    });

    const context = { ...baseContext, previousDraft: "Same exact draft." };
    await expect(generateValidatedAsset(context)).rejects.toThrow(/Regeneration produced the same draft/);
    
    // Ensure it retried with forceVariation
    expect(vi.mocked(generatePlatformNativeAsset)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(generatePlatformNativeAsset).mock.calls[1][0].forceVariation).toBe(true);
  });

  it('handles regeneration and accepts if retry produces different text', async () => {
    vi.mocked(generatePlatformNativeAsset)
      .mockResolvedValueOnce({
        title: null,
        body: "Same exact draft.",
      })
      .mockResolvedValueOnce({
        title: null,
        body: "A materially different draft.",
      });

    const context = { ...baseContext, previousDraft: "Same exact draft." };
    const result = await generateValidatedAsset(context);
    
    expect(result.body).toBe("A materially different draft.");
    expect(vi.mocked(generatePlatformNativeAsset)).toHaveBeenCalledTimes(2);
  });
});
