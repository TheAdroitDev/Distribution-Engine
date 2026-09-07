import { describe, it, expect, vi } from 'vitest';
import { createContentSource, deleteContentSource } from './actions';
import { auth } from '@/lib/auth/auth';

vi.mock('@/lib/auth/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    }
  }
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

describe('Content Actions', () => {
  it('rejects unauthenticated user on create', async () => {
    // Mock getSession to return null
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('type', 'TEXT');
    formData.append('rawContent', 'Content');

    const result = await createContentSource(formData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects unauthenticated user on delete', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await deleteContentSource('test-content-id');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized.');
  });
});
