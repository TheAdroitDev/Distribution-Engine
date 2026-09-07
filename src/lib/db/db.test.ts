import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { users, distributionProfiles, contentSources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('Database Foundation', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create a test user
    const [user] = await db.insert(users).values({
      id: `test-id-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      emailVerified: true,
    }).returning();
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('DistributionProfile -> User relationship works', async () => {
    const [profile] = await db.insert(distributionProfiles).values({
      userId: testUserId,
      expertise: ['React', 'Next.js'],
    }).returning();

    expect(profile.userId).toBe(testUserId);
    expect(profile.expertise).toEqual(['React', 'Next.js']);

    // Fetch user with profile
    const fetchedProfile = await db.query.distributionProfiles.findFirst({
      where: (p, { eq }) => eq(p.userId, testUserId)
    });
    expect(fetchedProfile).toBeDefined();
    expect(fetchedProfile?.expertise).toEqual(['React', 'Next.js']);
  });

  it('ContentSource persists correctly and User -> ContentSource relationship works', async () => {
    const [source] = await db.insert(contentSources).values({
      userId: testUserId,
      title: 'Test Content',
      type: 'TEXT',
      rawContent: 'This is a test content source.',
    }).returning();

    expect(source.userId).toBe(testUserId);
    expect(source.title).toBe('Test Content');
    expect(source.type).toBe('TEXT');

    // Fetch the source
    const fetchedSource = await db.query.contentSources.findFirst({
      where: (s, { eq }) => eq(s.id, source.id)
    });

    expect(fetchedSource).toBeDefined();
    expect(fetchedSource?.rawContent).toBe('This is a test content source.');
  });
});
