import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile, updateAudience, deleteAudience } from './actions';
import { profileSchema, audienceSchema } from './validation';

// Mock DB and Auth
vi.mock('@/lib/db', () => {
  return {
    db: {
      query: {
        distributionProfiles: {
          findFirst: vi.fn(),
        }
      },
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue({ rowCount: 1 })
        }))
      })),
      insert: vi.fn(() => ({
        values: vi.fn().mockResolvedValue({ rowCount: 1 })
      })),
      delete: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({ rowCount: 1 })
      }))
    }
  };
});

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

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Profile and Audiences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Schemas', () => {
    it('Audience requires name', () => {
      const invalid = { description: 'No name' };
      const res = audienceSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it('Profile accepts empty defaults', () => {
      const res = profileSchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.expertise).toEqual([]);
      }
    });
  });

  describe('Actions', () => {
    it('updateProfile blocks unauthenticated users', async () => {
      const { auth } = await import('@/lib/auth/auth');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const res = await updateProfile({ expertise: [], topics: [], preferredPlatforms: [], secondaryGoals: [], contentPreferences: [] });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized.');
    });

    it('updateAudience verifies ownership implicitly via where clause', async () => {
      const { auth } = await import('@/lib/auth/auth');
      const { db } = await import('@/lib/db');
      
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-a' } } as never);
      
      // Simulate db.update returning 0 rows (meaning it didn't match the ID AND userId)
      const setMock = vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })) }));
      vi.mocked(db.update).mockReturnValue({ set: setMock } as never);

      const res = await updateAudience('aud-123', { name: 'New Name', interests: [], problems: [], platformAffinity: [] });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Not found or unauthorized');
    });

    it('deleteAudience blocks unauthorized users', async () => {
       const { auth } = await import('@/lib/auth/auth');
       const { db } = await import('@/lib/db');
       
       vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-b' } } as never);
       vi.mocked(db.delete).mockReturnValue({ where: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })) } as never);

       const res = await deleteAudience('aud-123');
       expect(res.success).toBe(false);
       expect(res.error).toBe('Not found or unauthorized');
    });

    it('deleteAccount blocks unauthenticated users', async () => {
      const { auth } = await import('@/lib/auth/auth');
      const { deleteAccount } = await import('./actions');
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const res = await deleteAccount();
      expect(res.success).toBe(false);
      expect(res.error).toBe('Unauthorized.');
    });

    it('deleteAccount deletes user and returns success', async () => {
      const { auth } = await import('@/lib/auth/auth');
      const { db } = await import('@/lib/db');
      const { deleteAccount } = await import('./actions');

      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-to-delete' } } as never);
      vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue({ rowCount: 1 }) } as never);

      const res = await deleteAccount();
      expect(res.success).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
