/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  recordOutcomeAction, 
  setExpectedOutcomeAction, 
  getOutcomesForQueueItemAction,
  getOutcomeHistoryForStrategyAction
} from './actions';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/auth';

// Mock DB and Auth
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      distributionQueueItems: { findFirst: vi.fn(), findMany: vi.fn() },
      distributionOutcomes: { findMany: vi.fn() },
      distributionStrategies: { findFirst: vi.fn() },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 'test-outcome-123' }])
      }))
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(true)
      }))
    }))
  }
}));

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn()
    }
  }
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));
vi.mock('next/headers', () => ({
  headers: vi.fn()
}));

describe('Outcomes Server Actions', () => {
  const MOCK_USER_ID = 'test-user-id';
  const MOCK_QUEUE_ITEM_ID = 'test-queue-item';

  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as any).mockResolvedValue({
      user: { id: MOCK_USER_ID }
    });
  });

  describe('setExpectedOutcomeAction', () => {
    it('requires authentication', async () => {
      (auth.api.getSession as any).mockResolvedValueOnce(null);
      const res = await setExpectedOutcomeAction(MOCK_QUEUE_ITEM_ID, "Should work");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Unauthorized.");
    });

    it('validates input length', async () => {
      const res = await setExpectedOutcomeAction("", "test"); // Empty ID
      expect(res.success).toBe(false);
      
      const tooLong = "a".repeat(501);
      const res2 = await setExpectedOutcomeAction(MOCK_QUEUE_ITEM_ID, tooLong);
      expect(res2.success).toBe(false);
    });

    it('rejects if queue item not found or unowned', async () => {
      (db.query.distributionQueueItems.findFirst as any).mockResolvedValue(null);
      const res = await setExpectedOutcomeAction(MOCK_QUEUE_ITEM_ID, "test");
      expect(res.success).toBe(false);
      expect(res.error).toContain("not found");
    });

    it('updates expected outcome successfully', async () => {
      (db.query.distributionQueueItems.findFirst as any).mockResolvedValue({
        id: MOCK_QUEUE_ITEM_ID,
        userId: MOCK_USER_ID
      });
      const res = await setExpectedOutcomeAction(MOCK_QUEUE_ITEM_ID, "Drive engagement");
      expect(res.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('recordOutcomeAction', () => {
    const validPayload = {
      queueItemId: MOCK_QUEUE_ITEM_ID,
      executedAt: new Date(),
      observedAt: new Date(),
      notes: "Some notes",
      metrics: {
        impressions: 100,
        engagements: 10
      }
    };

    it('requires authentication', async () => {
      (auth.api.getSession as any).mockResolvedValueOnce(null);
      const res = await recordOutcomeAction(validPayload);
      expect(res.success).toBe(false);
    });

    it('requires COMPLETED queue item', async () => {
      (db.query.distributionQueueItems.findFirst as any).mockResolvedValue({
        id: MOCK_QUEUE_ITEM_ID,
        userId: MOCK_USER_ID,
        status: "PENDING"
      });
      const res = await recordOutcomeAction(validPayload);
      expect(res.success).toBe(false);
      expect(res.error).toContain("COMPLETED");
    });

    it('validates strict metrics schema (rejects unknown keys)', async () => {
      const invalidPayload = {
        ...validPayload,
        metrics: {
          ...validPayload.metrics,
          unknown_metric: 5
        }
      };
      // Type casting to any to bypass TS error for testing
      const res = await recordOutcomeAction(invalidPayload as any);
      expect(res.success).toBe(false);
    });

    it('validates strict metrics schema (rejects negative numbers)', async () => {
      const invalidPayload = {
        ...validPayload,
        metrics: {
          impressions: -5
        }
      };
      const res = await recordOutcomeAction(invalidPayload);
      expect(res.success).toBe(false);
    });

    it('records valid outcome for owned completed item', async () => {
      (db.query.distributionQueueItems.findFirst as any).mockResolvedValue({
        id: MOCK_QUEUE_ITEM_ID,
        userId: MOCK_USER_ID,
        status: "COMPLETED"
      });
      
      const res = await recordOutcomeAction(validPayload);
      expect(res.success).toBe(true);
      expect(res.outcomeId).toBe('test-outcome-123');
      expect(db.insert).toHaveBeenCalled();
    });
  });
});
