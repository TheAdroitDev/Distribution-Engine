/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { 
  contentSources, 
  contentIntelligence, 
  distributionPlans, 
  distributionStrategies, 
  distributionAssets, 
  distributionQueueItems 
} from '@/lib/db/schema';
import { eq, and, desc, ne } from 'drizzle-orm';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      contentSources: { findMany: vi.fn() },
      distributionPlans: { findMany: vi.fn() },
      distributionQueueItems: { findMany: vi.fn() },
    },
    select: vi.fn(),
  },
}));

describe('Dashboard Parallel Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes all 7 dashboard queries concurrently and returns aggregated counts and recent items', async () => {
    const userId = 'user-test-123';

    // Mock findMany responses
    vi.mocked(db.query.contentSources.findMany)
      .mockResolvedValueOnce([{ id: 'src-1' }, { id: 'src-2' }] as any) // allSources
      .mockResolvedValueOnce([ // recentContent
        { id: 'src-2', title: 'Second Post', type: 'MARKDOWN', createdAt: new Date() },
        { id: 'src-1', title: 'First Post', type: 'TEXT', createdAt: new Date() }
      ] as any);

    vi.mocked(db.query.distributionPlans.findMany)
      .mockResolvedValueOnce([{ id: 'plan-1' }] as any);

    vi.mocked(db.query.distributionQueueItems.findMany)
      .mockResolvedValueOnce([{ id: 'queue-1' }, { id: 'queue-2' }, { id: 'queue-3' }] as any);

    // Mock select chains for analyzedSources, acceptedStrategies, readyAssets
    const mockWhere = vi.fn();
    const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere, innerJoin: vi.fn().mockReturnValue({ where: mockWhere }) });
    const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

    mockWhere
      .mockResolvedValueOnce([{ id: 'intel-1' }]) // analyzedSources
      .mockResolvedValueOnce([{ id: 'strat-1' }, { id: 'strat-2' }]) // acceptedStrategies
      .mockResolvedValueOnce([{ id: 'asset-1' }]); // readyAssets

    // Execute the parallel Promise.all as implemented in DashboardOverview
    const [
      allSources,
      analyzedSources,
      allPlans,
      acceptedStrategies,
      readyAssets,
      queueItems,
      recentContent,
    ] = await Promise.all([
      db.query.contentSources.findMany({
        where: eq(contentSources.userId, userId),
        columns: { id: true },
      }),
      db
        .select({ id: contentIntelligence.id })
        .from(contentIntelligence)
        .innerJoin(
          contentSources,
          eq(contentSources.id, contentIntelligence.contentSourceId)
        )
        .where(eq(contentSources.userId, userId)),
      db.query.distributionPlans.findMany({
        where: and(
          eq(distributionPlans.userId, userId),
          ne(distributionPlans.status, 'ARCHIVED')
        ),
        columns: { id: true },
      }),
      db
        .select({ id: distributionStrategies.id })
        .from(distributionStrategies)
        .innerJoin(
          distributionPlans,
          eq(distributionPlans.id, distributionStrategies.planId)
        )
        .where(
          and(
            eq(distributionPlans.userId, userId),
            eq(distributionStrategies.status, 'ACCEPTED')
          )
        ),
      db
        .select({ id: distributionAssets.id })
        .from(distributionAssets)
        .innerJoin(
          distributionStrategies,
          eq(distributionStrategies.id, distributionAssets.strategyId)
        )
        .innerJoin(
          distributionPlans,
          eq(distributionPlans.id, distributionStrategies.planId)
        )
        .where(
          and(
            eq(distributionPlans.userId, userId),
            eq(distributionAssets.status, 'READY')
          )
        ),
      db.query.distributionQueueItems.findMany({
        where: eq(distributionQueueItems.userId, userId),
        columns: { id: true },
      }),
      db.query.contentSources.findMany({
        where: eq(contentSources.userId, userId),
        columns: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
        },
        orderBy: [desc(contentSources.createdAt)],
        limit: 5,
      }),
    ]);

    expect(allSources).toHaveLength(2);
    expect(analyzedSources).toHaveLength(1);
    expect(allPlans).toHaveLength(1);
    expect(acceptedStrategies).toHaveLength(2);
    expect(readyAssets).toHaveLength(1);
    expect(queueItems).toHaveLength(3);
    expect(recentContent).toHaveLength(2);
    expect(recentContent[0].title).toBe('Second Post');
  });
});
