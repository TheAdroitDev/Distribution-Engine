import { db } from "@/lib/db";
import { 
  users, 
  contentSources, 
  distributionPlans, 
  distributionStrategies, 
  distributionAssets, 
  distributionQueueItems, 
  distributionOutcomes 
} from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";

export interface AdminSystemStats {
  totalUsers: number;
  totalContentSources: number;
  totalPlans: number;
  totalStrategies: number;
  totalAssets: number;
  totalQueueItems: number;
  totalOutcomes: number;
  completedQueueItems: number;
  acceptedStrategies: number;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  sourcesCount: number;
  plansCount: number;
  assetsCount: number;
}

export async function getAdminDashboardData() {
  const [
    usersCountRes,
    sourcesCountRes,
    plansCountRes,
    strategiesCountRes,
    assetsCountRes,
    queueCountRes,
    outcomesCountRes,
    completedQueueRes,
    acceptedStrategiesRes
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(contentSources),
    db.select({ value: count() }).from(distributionPlans),
    db.select({ value: count() }).from(distributionStrategies),
    db.select({ value: count() }).from(distributionAssets),
    db.select({ value: count() }).from(distributionQueueItems),
    db.select({ value: count() }).from(distributionOutcomes),
    db.select({ value: count() }).from(distributionQueueItems).where(eq(distributionQueueItems.status, "COMPLETED")),
    db.select({ value: count() }).from(distributionStrategies).where(eq(distributionStrategies.status, "ACCEPTED")),
  ]);

  const stats: AdminSystemStats = {
    totalUsers: usersCountRes[0]?.value || 0,
    totalContentSources: sourcesCountRes[0]?.value || 0,
    totalPlans: plansCountRes[0]?.value || 0,
    totalStrategies: strategiesCountRes[0]?.value || 0,
    totalAssets: assetsCountRes[0]?.value || 0,
    totalQueueItems: queueCountRes[0]?.value || 0,
    totalOutcomes: outcomesCountRes[0]?.value || 0,
    completedQueueItems: completedQueueRes[0]?.value || 0,
    acceptedStrategies: acceptedStrategiesRes[0]?.value || 0,
  };

  const rawUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(20);

  const userList: AdminUserListItem[] = await Promise.all(
    rawUsers.map(async (u) => {
      const [uSources, uPlans, uAssets] = await Promise.all([
        db.select({ count: count() }).from(contentSources).where(eq(contentSources.userId, u.id)),
        db.select({ count: count() }).from(distributionPlans).where(eq(distributionPlans.userId, u.id)),
        db.select({ count: count() }).from(distributionAssets).where(eq(distributionAssets.userId, u.id)),
      ]);

      return {
        id: u.id,
        name: u.name || "Unnamed",
        email: u.email,
        emailVerified: u.emailVerified,
        image: u.image,
        createdAt: u.createdAt,
        sourcesCount: uSources[0]?.count || 0,
        plansCount: uPlans[0]?.count || 0,
        assetsCount: uAssets[0]?.count || 0,
      };
    })
  );

  const recentSources = await db
    .select({
      id: contentSources.id,
      title: contentSources.title,
      createdAt: contentSources.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(contentSources)
    .leftJoin(users, eq(contentSources.userId, users.id))
    .orderBy(desc(contentSources.createdAt))
    .limit(8);

  const recentQueue = await db
    .select({
      id: distributionQueueItems.id,
      status: distributionQueueItems.status,
      scheduledAt: distributionQueueItems.scheduledAt,
      createdAt: distributionQueueItems.createdAt,
      userName: users.name,
      userEmail: users.email,
      formatId: distributionAssets.formatId,
      title: distributionAssets.title,
    })
    .from(distributionQueueItems)
    .leftJoin(users, eq(distributionQueueItems.userId, users.id))
    .leftJoin(distributionAssets, eq(distributionQueueItems.assetId, distributionAssets.id))
    .orderBy(desc(distributionQueueItems.createdAt))
    .limit(8);

  return {
    stats,
    users: userList,
    recentSources,
    recentQueue,
  };
}
