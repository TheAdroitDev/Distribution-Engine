"use server";

import { db } from "@/lib/db";
import {
  distributionQueueItems,
  distributionOutcomes,
  distributionStrategies,
} from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  createOutcomeSchema,
  setExpectedOutcomeSchema,
  type CreateOutcomeInput,
} from "./schemas/outcome-schema";

export async function recordOutcomeAction(input: CreateOutcomeInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  // Validate input
  const parsed = createOutcomeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  // Verify queue item ownership
  const queueItem = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, parsed.data.queueItemId),
      eq(distributionQueueItems.userId, userId)
    ),
  });

  if (!queueItem) {
    return { success: false, error: "Queue item not found or unauthorized." };
  }

  if (queueItem.status !== "COMPLETED") {
    return { success: false, error: "Can only record outcomes for COMPLETED queue items." };
  }

  // Insert immutable outcome
  const [newOutcome] = await db
    .insert(distributionOutcomes)
    .values({
      userId,
      queueItemId: parsed.data.queueItemId,
      executedAt: parsed.data.executedAt,
      observedAt: parsed.data.observedAt,
      notes: parsed.data.notes || null,
      metrics: parsed.data.metrics,
    })
    .returning();

  revalidatePath("/queue");
  revalidatePath("/outcomes");
  return { success: true, outcomeId: newOutcome.id };
}

export async function setExpectedOutcomeAction(
  queueItemId: string,
  expectedOutcome: string | null
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  const parsed = setExpectedOutcomeSchema.safeParse({ queueItemId, expectedOutcome });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const item = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, queueItemId),
      eq(distributionQueueItems.userId, userId)
    ),
  });

  if (!item) {
    return { success: false, error: "Queue item not found or unauthorized." };
  }

  await db
    .update(distributionQueueItems)
    .set({ expectedOutcome: parsed.data.expectedOutcome, updatedAt: new Date() })
    .where(eq(distributionQueueItems.id, queueItemId));

  revalidatePath("/queue");
  return { success: true };
}

export async function getOutcomesForQueueItemAction(queueItemId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized.", outcomes: [] };
  const userId = session.user.id;

  // Verify ownership
  const item = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, queueItemId),
      eq(distributionQueueItems.userId, userId)
    ),
  });

  if (!item) return { success: false, error: "Not found.", outcomes: [] };

  const outcomes = await db.query.distributionOutcomes.findMany({
    where: and(
      eq(distributionOutcomes.queueItemId, queueItemId),
      eq(distributionOutcomes.userId, userId)
    ),
    orderBy: [asc(distributionOutcomes.observedAt)],
  });

  return { success: true, outcomes };
}

export async function getOutcomeHistoryForStrategyAction(strategyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized.", outcomes: [] };
  const userId = session.user.id;

  // Verify strategy ownership
  const strategy = await db.query.distributionStrategies.findFirst({
    where: eq(distributionStrategies.id, strategyId),
    with: { plan: true },
  });

  if (!strategy || strategy.plan.userId !== userId) {
    return { success: false, error: "Not found.", outcomes: [] };
  }

  // Get all queue items for this strategy, then their outcomes
  const queueItems = await db.query.distributionQueueItems.findMany({
    where: and(
      eq(distributionQueueItems.strategyId, strategyId),
      eq(distributionQueueItems.userId, userId)
    ),
    with: {
      outcomes: {
        orderBy: [asc(distributionOutcomes.observedAt)],
      },
    },
  });

  const allOutcomes = queueItems.flatMap((qi) => qi.outcomes);
  allOutcomes.sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime());

  return { success: true, outcomes: allOutcomes };
}
