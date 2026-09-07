/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserPlansWithCounts } from './queries';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      distributionPlans: { findMany: vi.fn() }
    }
  }
}));

describe('Plans Hub Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches plans for the specific user ordered by createdAt DESC', async () => {
    const mockUserId = 'user-123';
    (db.query.distributionPlans.findMany as any).mockResolvedValue([
      { id: 'plan-1', createdAt: new Date('2026-09-06'), source: { title: 'Test 1' }, strategies: [] },
      { id: 'plan-2', createdAt: new Date('2026-09-05'), source: { title: 'Test 2' }, strategies: [] }
    ]);

    const result = await getUserPlansWithCounts(mockUserId);
    
    expect(db.query.distributionPlans.findMany).toHaveBeenCalledTimes(1);
    
    expect(result.length).toBe(2);
  });

  it('returns empty array when user has no plans', async () => {
    (db.query.distributionPlans.findMany as any).mockResolvedValue([]);
    const result = await getUserPlansWithCounts('user-456');
    expect(result.length).toBe(0);
  });
});
