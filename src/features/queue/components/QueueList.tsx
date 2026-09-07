"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { updateQueueItemStatusAction, deleteQueueItemAction } from "../actions";
import Link from "next/link";
import { PLATFORMS } from "@/features/platforms/definitions";
import { Check, Trash2 } from "lucide-react";

type QueueItemWithRelations = {
  id: string;
  strategyId: string;
  scheduledAt: Date;
  status: string;
  strategy: {
    platformId: string;
    formatId: string;
    actionId: string;
    plan: { contentSourceId: string };
    audience: { name: string };
    idea: { title: string } | null;
  };
  asset: { title: string | null; body: string } | null;
};

export function QueueItemCard({ item }: { item: QueueItemWithRelations }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    startTransition(async () => {
      const result = await updateQueueItemStatusAction(item.id, newStatus);
      if (result.success) {
        toast.success(`Item marked as ${newStatus.replace('_', ' ')}.`);
      } else {
        toast.error(result.error || "Failed to update item status.");
      }
    });
  };

  const handleDeleteItem = () => {
    startTransition(async () => {
      const result = await deleteQueueItemAction(item.id);
      if (result.success) {
        toast.success("Queue item deleted.");
      } else {
        toast.error(result.error || "Failed to delete item.");
      }
    });
  };

  const platformName = PLATFORMS[item.strategy.platformId as keyof typeof PLATFORMS]?.name || item.strategy.platformId;

  return (
    <Card className="flex flex-col relative mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {platformName} - {item.strategy.formatId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-md border">
              {format(new Date(item.scheduledAt), "MMM d, h:mm a")}
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
              item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
              item.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {item.status.replace('_', ' ')}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDeleteItem}
              disabled={isPending}
              title="Delete queue item"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span><strong>Action:</strong> {item.strategy.actionId}</span>
          <span><strong>Audience:</strong> {item.strategy.audience.name}</span>
          {item.strategy.idea && <span><strong>Idea:</strong> {item.strategy.idea.title}</span>}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-3">
        <div>
          <h4 className="text-sm font-semibold mb-1">Asset Ready:</h4>
          {item.asset ? (
            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border-l-2 border-primary/40 truncate">
              {item.asset.title || item.asset.body.substring(0, 100) + '...'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No asset associated.</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t p-4 bg-muted/10">
        <div>
           <Link 
             href={`/content/${item.strategy.plan.contentSourceId}/distribution/${item.strategyId}`}
             className="text-sm text-primary hover:underline font-medium"
           >
             View Strategy & Asset &rarr;
           </Link>
        </div>
        <div className="flex items-center gap-2">
          {item.status === 'PENDING' && (
            <>
              <Button variant="outline" size="sm" onClick={handleDeleteItem} disabled={isPending}>
                Skip
              </Button>
              <Button size="sm" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={isPending}>
                Start
              </Button>
            </>
          )}
          {item.status === 'IN_PROGRESS' && (
            <>
              <Button variant="outline" size="sm" onClick={handleDeleteItem} disabled={isPending}>
                Skip
              </Button>
              <Button size="sm" onClick={() => handleStatusUpdate('COMPLETED')} disabled={isPending}>
                Complete
              </Button>
            </>
          )}
          {item.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <Check className="size-3.5" />
              <span>Completed</span>
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export function QueueList({ items }: { items: QueueItemWithRelations[] }) {
  const pendingItems = items.filter(i => i.status === 'PENDING' || i.status === 'IN_PROGRESS');
  const completedItems = items.filter(i => i.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4">Pending & In Progress</h3>
        {pendingItems.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Add a READY asset to your queue when you&apos;re ready to execute.</p>
          </div>
        ) : (
          pendingItems.map(item => <QueueItemCard key={item.id} item={item} />)
        )}
      </div>

      {completedItems.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-muted-foreground">Completed</h3>
          {completedItems.map(item => <QueueItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
