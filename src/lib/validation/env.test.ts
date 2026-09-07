import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

describe('Environment Validation', () => {
  it('Valid environment succeeds', () => {
    const result = envSchema.safeParse({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' });
    expect(result.success).toBe(true);
  });

  it('Missing required environment fails', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('Invalid url format fails', () => {
    const result = envSchema.safeParse({ DATABASE_URL: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});
