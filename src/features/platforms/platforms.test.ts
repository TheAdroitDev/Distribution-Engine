import { describe, it, expect } from 'vitest';
import { getPlatformDefinitions, PLATFORMS } from './definitions';

describe('Platform Capability Model', () => {
  it('exactly 7 platforms exist', () => {
    const definitions = getPlatformDefinitions();
    expect(definitions).toHaveLength(7);
  });

  it('validates each platform structure', () => {
    const definitions = getPlatformDefinitions();
    definitions.forEach(platform => {
      // Valid ID
      expect(typeof platform.id).toBe('string');
      
      // Purpose exists
      expect(platform.purpose.length).toBeGreaterThan(0);
      
      // Formats exist
      expect(platform.formats.length).toBeGreaterThan(0);
      
      // Actions exist
      expect(platform.actions.length).toBeGreaterThan(0);
      
      // Constraints exist
      expect(platform.constraints).toBeDefined();
      expect(typeof platform.constraints.supportsLongForm).toBe('boolean');
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(platform.constraints.promotionSensitivity);

      // Strategy rules exist
      expect(platform.strategyRules).toBeDefined();
      expect(Array.isArray(platform.strategyRules.strengths)).toBe(true);

      // Goal affinity valid (0 to 1)
      Object.values(platform.goalAffinity).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1.0);
      });
    });
  });

  it('validates specific platform capability examples', () => {
    // X supports technical opinion
    expect(PLATFORMS['x'].formats).toContain('technical_opinion');

    // LinkedIn supports case study
    expect(PLATFORMS['linkedin'].formats).toContain('case_study');

    // Peerlist supports project showcase
    expect(PLATFORMS['peerlist'].formats).toContain('project_showcase');

    // GitHub supports documentation
    expect(PLATFORMS['github'].formats).toContain('documentation');

    // Reddit supports discussion
    expect(PLATFORMS['reddit'].formats).toContain('discussion');

    // Blog supports deep dive
    expect(PLATFORMS['blog'].formats).toContain('deep_dive');

    // Portfolio supports case study
    expect(PLATFORMS['portfolio'].formats).toContain('case_study');
  });
});
