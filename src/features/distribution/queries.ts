import { db } from "@/lib/db";
import { distributionPlans } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getUserPlansWithCounts(userId: string) {
  return await db.query.distributionPlans.findMany({
    where: eq(distributionPlans.userId, userId),
    orderBy: [desc(distributionPlans.createdAt)],
    with: {
      source: {
        columns: {
          id: true,
          title: true,
          type: true,
        },
      },
      strategies: {
        columns: {
          id: true,
          status: true,
        },
        with: {
          assets: {
            columns: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

