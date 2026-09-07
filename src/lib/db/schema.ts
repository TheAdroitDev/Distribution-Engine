import { pgTable, text, timestamp, jsonb, boolean, unique, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  issuer: text('issuer').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    accountIdIssuerUnique: unique('accounts_account_id_issuer_unique').on(table.accountId, table.issuer)
  }
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributionProfiles = pgTable('distribution_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expertise: jsonb('expertise').$type<string[]>(),
  topics: jsonb('topics').$type<string[]>(),
  preferredPlatforms: jsonb('preferred_platforms').$type<string[]>(),
  primaryGoal: text('primary_goal'),
  secondaryGoals: jsonb('secondary_goals').$type<string[]>(),
  voicePreferences: jsonb('voice_preferences').$type<{ tone?: string, verbosity?: string, technicality?: string, formality?: string, opinionatedness?: string }>(),
  promotionTolerance: text('promotion_tolerance'),
  contentPreferences: jsonb('content_preferences').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const audiences = pgTable('audiences', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  interests: jsonb('interests').$type<string[]>().notNull().default([]),
  problems: jsonb('problems').$type<string[]>().notNull().default([]),
  platformAffinity: jsonb('platform_affinity').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentSources = pgTable('content_sources', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // e.g. TEXT, MARKDOWN
  rawContent: text('raw_content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentIntelligence = pgTable('content_intelligence', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contentSourceId: text('content_source_id').references(() => contentSources.id, { onDelete: 'cascade' }).notNull().unique(),
  summary: text('summary').notNull(),
  coreThesis: text('core_thesis'),
  topics: jsonb('topics').$type<string[]>().notNull().default([]),
  technicalConcepts: jsonb('technical_concepts').$type<string[]>().notNull().default([]),
  opinions: jsonb('opinions').$type<string[]>().notNull().default([]),
  lessons: jsonb('lessons').$type<string[]>().notNull().default([]),
  examples: jsonb('examples').$type<string[]>().notNull().default([]),
  audiences: jsonb('audiences').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentIdeas = pgTable('content_ideas', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  contentIntelligenceId: text('content_intelligence_id').references(() => contentIntelligence.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  angle: text('angle').notNull(),
  sourceContext: text('source_context').notNull(),
  importance: integer('importance').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contentSourcesRelations = relations(contentSources, ({ one, many }) => ({
  intelligence: one(contentIntelligence, {
    fields: [contentSources.id],
    references: [contentIntelligence.contentSourceId],
  }),
  plans: many(distributionPlans),
}));

export const contentIntelligenceRelations = relations(contentIntelligence, ({ one, many }) => ({
  source: one(contentSources, {
    fields: [contentIntelligence.contentSourceId],
    references: [contentSources.id],
  }),
  ideas: many(contentIdeas),
}));

export const contentIdeasRelations = relations(contentIdeas, ({ one }) => ({
  intelligence: one(contentIntelligence, {
    fields: [contentIdeas.contentIntelligenceId],
    references: [contentIntelligence.id],
  }),
}));

export const distributionPlans = pgTable('distribution_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  contentSourceId: text('content_source_id').references(() => contentSources.id, { onDelete: 'cascade' }).notNull(),
  primaryGoalId: text('primary_goal_id').notNull(),
  status: text('status').notNull(), // 'DRAFT', 'RECOMMENDED', 'IN_PROGRESS', 'COMPLETED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributionStrategies = pgTable('distribution_strategies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text('plan_id').references(() => distributionPlans.id, { onDelete: 'cascade' }).notNull(),
  contentIdeaId: text('content_idea_id').references(() => contentIdeas.id, { onDelete: 'cascade' }).notNull(),
  platformId: text('platform_id').notNull(),
  audienceId: text('audience_id').references(() => audiences.id, { onDelete: 'cascade' }).notNull(),
  goalId: text('goal_id').notNull(),
  formatId: text('format_id').notNull(),
  actionId: text('action_id').notNull(),
  rank: integer('rank').notNull(),
  score: integer('score').notNull(), // Could be multiplied by 100 for integer, e.g. 85 for 0.85
  rationale: text('rationale').notNull(),
  angle: text('angle').notNull(),
  status: text('status').notNull(), // 'RECOMMENDED', 'ACCEPTED', 'REJECTED', 'COMPLETED'
  origin: text('origin').notNull(), // 'AI_RECOMMENDED', 'USER_CREATED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributionPlansRelations = relations(distributionPlans, ({ one, many }) => ({
  source: one(contentSources, {
    fields: [distributionPlans.contentSourceId],
    references: [contentSources.id],
  }),
  strategies: many(distributionStrategies),
}));

export const distributionStrategiesRelations = relations(distributionStrategies, ({ one, many }) => ({
  plan: one(distributionPlans, {
    fields: [distributionStrategies.planId],
    references: [distributionPlans.id],
  }),
  idea: one(contentIdeas, {
    fields: [distributionStrategies.contentIdeaId],
    references: [contentIdeas.id],
  }),
  audience: one(audiences, {
    fields: [distributionStrategies.audienceId],
    references: [audiences.id],
  }),
  assets: many(distributionAssets),
  queueItems: many(distributionQueueItems),
}));


export const distributionAssets = pgTable('distribution_assets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  strategyId: text('strategy_id').references(() => distributionStrategies.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  formatId: text('format_id').notNull(),
  title: text('title'),
  body: text('body').notNull(),
  metadata: jsonb('metadata').$type<{ items?: string[] }>(),
  status: text('status').notNull(), // 'DRAFT', 'READY', 'ARCHIVED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributionAssetsRelations = relations(distributionAssets, ({ one }) => ({
  strategy: one(distributionStrategies, {
    fields: [distributionAssets.strategyId],
    references: [distributionStrategies.id],
  }),
  user: one(users, {
    fields: [distributionAssets.userId],
    references: [users.id],
  }),
}));

export const distributionQueueItems = pgTable('distribution_queue_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  strategyId: text('strategy_id').references(() => distributionStrategies.id, { onDelete: 'cascade' }).notNull(),
  assetId: text('asset_id').references(() => distributionAssets.id, { onDelete: 'set null' }),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: text('status').notNull(), // 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'
  expectedOutcome: text('expected_outcome'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributionOutcomes = pgTable('distribution_outcomes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  queueItemId: text('queue_item_id').references(() => distributionQueueItems.id, { onDelete: 'cascade' }).notNull(),
  executedAt: timestamp('executed_at').notNull(),
  observedAt: timestamp('observed_at').notNull(),
  notes: text('notes'),
  metrics: jsonb('metrics').$type<Record<string, number>>().notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const distributionQueueItemsRelations = relations(distributionQueueItems, ({ one, many }) => ({
  user: one(users, {
    fields: [distributionQueueItems.userId],
    references: [users.id],
  }),
  strategy: one(distributionStrategies, {
    fields: [distributionQueueItems.strategyId],
    references: [distributionStrategies.id],
  }),
  asset: one(distributionAssets, {
    fields: [distributionQueueItems.assetId],
    references: [distributionAssets.id],
  }),
  outcomes: many(distributionOutcomes),
}));

export const distributionOutcomesRelations = relations(distributionOutcomes, ({ one }) => ({
  user: one(users, {
    fields: [distributionOutcomes.userId],
    references: [users.id],
  }),
  queueItem: one(distributionQueueItems, {
    fields: [distributionOutcomes.queueItemId],
    references: [distributionQueueItems.id],
  }),
}));

