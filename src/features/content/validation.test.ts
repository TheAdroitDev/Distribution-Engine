import { describe, it, expect } from 'vitest';
import { contentSourceSchema } from './validation';

describe('Content Source Validation', () => {
  it('Valid text creates successfully', () => {
    const result = contentSourceSchema.safeParse({
      title: 'My Title',
      type: 'TEXT',
      rawContent: 'Some content',
    });
    expect(result.success).toBe(true);
  });

  it('Empty text is rejected', () => {
    const result = contentSourceSchema.safeParse({
      title: 'My Title',
      type: 'TEXT',
      rawContent: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Content is required');
    }
  });

  it('Unsupported content type is rejected', () => {
    const result = contentSourceSchema.safeParse({
      title: 'My Title',
      type: 'INVALID_TYPE',
      rawContent: 'Some content',
    });
    expect(result.success).toBe(false);
  });
});
