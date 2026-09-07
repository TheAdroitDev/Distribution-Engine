import { db } from "@/lib/db";
import { distributionQueueItems } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { QueueList } from "@/features/queue/components/QueueList";
export default async function QueuePage() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const items = await db.query.distributionQueueItems.findMany({
    where: eq(distributionQueueItems.userId, session.user.id),
    orderBy: [
      asc(distributionQueueItems.scheduledAt),
      asc(distributionQueueItems.createdAt)
    ],
    with: {
      strategy: {
        with: {
          plan: true,
          audience: true,
          idea: true
        }
      },
      asset: true
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Execution Queue</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your distribution execution planner. Completing scheduled items extends your daily execution streak.
        </p>
      </div>
      
      <QueueList items={items} />
    </div>
  );
}
