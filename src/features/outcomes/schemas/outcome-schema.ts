import { z } from 'zod';

export const outcomeMetricSchema = z.object({
  impressions:     z.number().int().nonnegative().optional(),
  engagements:     z.number().int().nonnegative().optional(),
  replies:         z.number().int().nonnegative().optional(),
  clicks:          z.number().int().nonnegative().optional(),
  profileVisits:   z.number().int().nonnegative().optional(),
  followersGained: z.number().int().nonnegative().optional(),
  stars:           z.number().int().nonnegative().optional(),
  forks:           z.number().int().nonnegative().optional(),
  comments:        z.number().int().nonnegative().optional(),
  leads:           z.number().int().nonnegative().optional(),
  opportunities:   z.number().int().nonnegative().optional(),
  connections:     z.number().int().nonnegative().optional(),
}).strict();

export type OutcomeMetrics = z.infer<typeof outcomeMetricSchema>;

export const createOutcomeSchema = z.object({
  queueItemId: z.string().min(1),
  executedAt:  z.coerce.date(),
  observedAt:  z.coerce.date(),
  notes:       z.string().max(2000).optional(),
  metrics:     outcomeMetricSchema,
});

export type CreateOutcomeInput = z.infer<typeof createOutcomeSchema>;

export const setExpectedOutcomeSchema = z.object({
  queueItemId:     z.string().min(1),
  expectedOutcome: z.string().max(500).nullish(),
});
