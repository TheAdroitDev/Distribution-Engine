"use server";

import { db } from "@/lib/db";
import { 
  distributionQueueItems, 
  distributionStrategies, 
  distributionAssets 
} from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addToQueueAction(strategyId: string, scheduledAt: Date) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  // Reject past scheduled times (with 60s tolerance for clock skew)
  if (new Date(scheduledAt).getTime() < Date.now() - 60000) {
    return { success: false, error: "Scheduled time must be in the future." };
  }

  const strategy = await db.query.distributionStrategies.findFirst({
    where: and(
      eq(distributionStrategies.id, strategyId),
    ),
    with: {
      plan: true
    }
  });

  if (!strategy || strategy.plan.userId !== userId) {
    return { success: false, error: "Strategy not found or unauthorized." };
  }

  if (strategy.status !== "ACCEPTED") {
    return { success: false, error: "Only ACCEPTED strategies can be added to the queue." };
  }

  // Find READY asset
  const assets = await db.query.distributionAssets.findMany({
    where: and(
      eq(distributionAssets.strategyId, strategyId),
      eq(distributionAssets.userId, userId),
      eq(distributionAssets.status, 'READY')
    )
  });

  if (assets.length === 0) {
    return { success: false, error: "A READY asset is required to add this strategy to the queue." };
  }
  
  const assetId = assets[0].id;

  // Idempotency: Prevent duplicate PENDING or IN_PROGRESS items for the same strategy
  const existingPending = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.strategyId, strategyId),
      eq(distributionQueueItems.userId, userId),
      or(
        eq(distributionQueueItems.status, 'PENDING'),
        eq(distributionQueueItems.status, 'IN_PROGRESS')
      )
    )
  });

  if (existingPending) {
    return { success: false, error: "This strategy is already in the queue." };
  }

  const [newItem] = await db.insert(distributionQueueItems).values({
    userId,
    strategyId,
    assetId,
    scheduledAt,
    status: 'PENDING',
  }).returning();

  revalidatePath('/queue');
  revalidatePath(`/content/${strategy.plan.contentSourceId}/distribution/${strategyId}`);
  
  return { success: true, itemId: newItem.id };
}

export async function updateQueueItemStatusAction(itemId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED') {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  const item = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, itemId),
      eq(distributionQueueItems.userId, userId)
    )
  });

  if (!item) {
    return { success: false, error: "Item not found or unauthorized." };
  }

  // Validate transitions
  if (item.status === 'COMPLETED' || item.status === 'SKIPPED') {
    return { success: false, error: "Cannot change status of a completed or skipped item." };
  }

  await db.update(distributionQueueItems)
    .set({
      status: newStatus,
      updatedAt: new Date()
    })
    .where(eq(distributionQueueItems.id, itemId));

  revalidatePath('/queue');
  return { success: true };
}

export async function updateQueueItemScheduleAction(itemId: string, scheduledAt: Date) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  const item = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, itemId),
      eq(distributionQueueItems.userId, userId)
    )
  });

  if (!item) {
    return { success: false, error: "Item not found or unauthorized." };
  }

  if (item.status !== 'PENDING') {
    return { success: false, error: "Can only reschedule PENDING items." };
  }

  await db.update(distributionQueueItems)
    .set({
      scheduledAt,
      updatedAt: new Date()
    })
    .where(eq(distributionQueueItems.id, itemId));

  revalidatePath('/queue');
  return { success: true };
}

export async function deleteQueueItemAction(itemId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { success: false, error: "Unauthorized." };
  const userId = session.user.id;

  const item = await db.query.distributionQueueItems.findFirst({
    where: and(
      eq(distributionQueueItems.id, itemId),
      eq(distributionQueueItems.userId, userId)
    )
  });

  if (!item) {
    return { success: false, error: "Item not found or unauthorized." };
  }

  await db.delete(distributionQueueItems).where(eq(distributionQueueItems.id, itemId));

  revalidatePath('/queue');
  return { success: true };
}

