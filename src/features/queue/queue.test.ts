import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addToQueueAction, updateQueueItemStatusAction } from './actions';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/auth';
import { distributionQueueItems } from '@/lib/db/schema';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      distributionStrategies: { findFirst: vi.fn() },
      distributionAssets: { findMany: vi.fn() },
      distributionQueueItems: { findFirst: vi.fn() },
    },
    insert: vi.fn(),
    update: vi.fn(),
  }
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}));

vi.mock('next/headers', () => ({
  headers: vi.fn()
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

const mockGetSession = vi.mocked(auth.api.getSession);
const mockFindStrategy = vi.mocked(db.query.distributionStrategies.findFirst);
const mockFindAssets = vi.mocked(db.query.distributionAssets.findMany);
const mockFindQueueItem = vi.mocked(db.query.distributionQueueItems.findFirst);

function setupMockInsert() {
  const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'new-queue-item-id' }])
    })
  });
  db.insert = mockInsert as unknown as typeof db.insert;
  return mockInsert;
}

function setupMockUpdate() {
  const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(true)
    })
  });
  db.update = mockUpdate as unknown as typeof db.update;
  return mockUpdate;
}

describe('Queue Actions (Phase 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } } as never);
  });

  describe('addToQueueAction', () => {
    it('rejects unauthenticated users', async () => {
      mockGetSession.mockResolvedValue(null as never);
      const result = await addToQueueAction('strategy-1', new Date());
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Unauthorized/);
    });

    it('rejects adding cross-user strategies', async () => {
      mockFindStrategy.mockResolvedValue({
        id: 'strategy-1',
        plan: { userId: 'different-user' },
        status: 'ACCEPTED'
      } as never);

      const result = await addToQueueAction('strategy-1', new Date());
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Strategy not found or unauthorized/);
    });

    it('rejects strategies that are not ACCEPTED', async () => {
      mockFindStrategy.mockResolvedValue({
        id: 'strategy-1',
        plan: { userId: 'user-1' },
        status: 'PENDING'
      } as never);

      const result = await addToQueueAction('strategy-1', new Date());
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Only ACCEPTED strategies/);
    });

    it('rejects when there is no READY asset', async () => {
      mockFindStrategy.mockResolvedValue({
        id: 'strategy-1',
        plan: { userId: 'user-1' },
        status: 'ACCEPTED'
      } as never);

      mockFindAssets.mockResolvedValue([] as never);

      const result = await addToQueueAction('strategy-1', new Date());
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/READY asset is required/);
    });

    it('rejects duplicates (already PENDING/IN_PROGRESS)', async () => {
      mockFindStrategy.mockResolvedValue({
        id: 'strategy-1',
        plan: { userId: 'user-1' },
        status: 'ACCEPTED'
      } as never);

      mockFindAssets.mockResolvedValue([{ id: 'asset-1' }] as never);
      mockFindQueueItem.mockResolvedValue({ id: 'item-1' } as never);

      const result = await addToQueueAction('strategy-1', new Date());
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already in the queue/);
    });

    it('successfully adds item to queue', async () => {
      mockFindStrategy.mockResolvedValue({
        id: 'strategy-1',
        plan: { userId: 'user-1', contentSourceId: 'src-1' },
        status: 'ACCEPTED'
      } as never);

      mockFindAssets.mockResolvedValue([{ id: 'asset-1' }] as never);
      mockFindQueueItem.mockResolvedValue(null as never);

      const mockInsert = setupMockInsert();

      const date = new Date();
      const result = await addToQueueAction('strategy-1', date);

      expect(result.success).toBe(true);
      expect(result.itemId).toBe('new-queue-item-id');
      expect(mockInsert).toHaveBeenCalledWith(distributionQueueItems);
    });
  });

  describe('updateQueueItemStatusAction', () => {
    it('enforces ownership', async () => {
      mockFindQueueItem.mockResolvedValue(null as never);
      const result = await updateQueueItemStatusAction('item-1', 'IN_PROGRESS');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Item not found or unauthorized/);
    });

    it('blocks transitions from COMPLETED', async () => {
      mockFindQueueItem.mockResolvedValue({
        id: 'item-1',
        status: 'COMPLETED'
      } as never);
      const result = await updateQueueItemStatusAction('item-1', 'PENDING');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Cannot change status/);
    });

    it('blocks transitions from SKIPPED', async () => {
      mockFindQueueItem.mockResolvedValue({
        id: 'item-1',
        status: 'SKIPPED'
      } as never);
      const result = await updateQueueItemStatusAction('item-1', 'PENDING');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Cannot change status/);
    });

    it('allows PENDING -> IN_PROGRESS', async () => {
      mockFindQueueItem.mockResolvedValue({
        id: 'item-1',
        status: 'PENDING'
      } as never);

      setupMockUpdate();

      const result = await updateQueueItemStatusAction('item-1', 'IN_PROGRESS');
      expect(result.success).toBe(true);
    });

    it('allows PENDING -> SKIPPED', async () => {
      mockFindQueueItem.mockResolvedValue({
        id: 'item-1',
        status: 'PENDING'
      } as never);

      setupMockUpdate();

      const result = await updateQueueItemStatusAction('item-1', 'SKIPPED');
      expect(result.success).toBe(true);
    });

    it('allows IN_PROGRESS -> COMPLETED', async () => {
      mockFindQueueItem.mockResolvedValue({
        id: 'item-1',
        status: 'IN_PROGRESS'
      } as never);

      setupMockUpdate();

      const result = await updateQueueItemStatusAction('item-1', 'COMPLETED');
      expect(result.success).toBe(true);
    });
  });
});
