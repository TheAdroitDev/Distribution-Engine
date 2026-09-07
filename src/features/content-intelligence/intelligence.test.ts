import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeContentSource } from './actions';
import { contentIntelligenceSchema } from './schemas/intelligence-schema';

// Mock DB and Auth
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      contentSources: {
        findFirst: vi.fn(),
      },
      distributionPlans: {
        findFirst: vi.fn(),
      },
    },
    transaction: vi.fn(),
  }
}));

vi.mock('@/features/distribution/actions', () => ({
  createDistributionPlan: vi.fn(),
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    }
  }
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('./lib/analyzer', () => ({
  analyzeContent: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Content Intelligence', () => {
  describe('Schemas', () => {
    it('Valid AI output passes Zod', () => {
      const valid = {
        summary: 'Test',
        coreThesis: 'Thesis',
        topics: ['t1'],
        technicalConcepts: ['c1'],
        opinions: ['o1'],
        lessons: ['l1'],
        examples: ['e1'],
        audiences: ['a1'],
        ideas: [
          {
            title: 'Idea 1',
            summary: 'Sum',
            angle: 'Educational',
            sourceContext: 'Ctx',
            importance: 5,
          }
        ]
      };
      const result = contentIntelligenceSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('Invalid AI output is rejected', () => {
      const invalid = {
        summary: 'Test',
        ideas: [{ title: 'Incomplete' }]
      };
      const result = contentIntelligenceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('Ownership: User A cannot analyze User B content', async () => {
      const { auth } = await import('@/lib/auth/auth');
      const { db } = await import('@/lib/db');
      
      // Setup mock session
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-a' } } as never);
      
      // Setup mock db to return null (content source not owned by user-a)
      vi.mocked(db.query.contentSources.findFirst).mockResolvedValue(null as never);

      const result = await analyzeContentSource('source-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Content source not found or unauthorized.');
    });

    it('Failure does not create fake intelligence', async () => {
      const { auth } = await import('@/lib/auth/auth');
      const { db } = await import('@/lib/db');
      const { analyzeContent } = await import('./lib/analyzer');

      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-a' } } as never);
      vi.mocked(db.query.contentSources.findFirst).mockResolvedValue({ id: 'source-123', rawContent: 'test' } as never);
      
      vi.mocked(analyzeContent).mockRejectedValue(new Error('AI Failed') as never);

      const result = await analyzeContentSource('source-123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('AI Failed');
      expect(db.transaction).not.toHaveBeenCalled();
    });
    
    it('Idempotency / Persistence', async () => {
      const { auth } = await import('@/lib/auth/auth');
      const { db } = await import('@/lib/db');
      const { analyzeContent } = await import('./lib/analyzer');

      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-a' } } as never);
      vi.mocked(db.query.contentSources.findFirst).mockResolvedValue({ id: 'source-123', rawContent: 'test' } as never);
      
      vi.mocked(analyzeContent).mockResolvedValue({
        summary: 'S', topics: [], technicalConcepts: [], opinions: [], lessons: [], examples: [], audiences: [], ideas: [], coreThesis: null
      } as never);

      const result = await analyzeContentSource('source-123');
      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });
  });
});
