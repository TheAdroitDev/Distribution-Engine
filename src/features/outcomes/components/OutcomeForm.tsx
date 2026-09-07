"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { recordOutcomeAction } from "../actions";
import type { OutcomeMetrics } from "../schemas/outcome-schema";

const METRIC_LABELS: { key: keyof OutcomeMetrics; label: string }[] = [
  { key: "impressions", label: "Impressions" },
  { key: "engagements", label: "Engagements" },
  { key: "replies", label: "Replies" },
  { key: "clicks", label: "Clicks" },
  { key: "profileVisits", label: "Profile Visits" },
  { key: "followersGained", label: "Followers Gained" },
  { key: "stars", label: "Stars" },
  { key: "forks", label: "Forks" },
  { key: "comments", label: "Comments" },
  { key: "leads", label: "Leads" },
  { key: "opportunities", label: "Opportunities" },
  { key: "connections", label: "Connections" },
];

// Platform-relevant metric hints
const PLATFORM_METRICS: Record<string, (keyof OutcomeMetrics)[]> = {
  x: ["impressions", "engagements", "replies", "clicks", "profileVisits", "followersGained"],
  linkedin: ["impressions", "engagements", "clicks", "profileVisits", "connections", "leads"],
  github: ["stars", "forks", "comments", "clicks"],
  peerlist: ["profileVisits", "connections", "opportunities"],
  reddit: ["engagements", "replies", "comments", "clicks"],
  blog: ["clicks", "profileVisits", "leads"],
  portfolio: ["clicks", "profileVisits", "leads"],
};

type OutcomeFormProps = {
  queueItemId: string;
  platformId: string;
  scheduledAt: Date;
  onSuccess?: () => void;
};

export function OutcomeForm({ queueItemId, platformId, scheduledAt, onSuccess }: OutcomeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [observedAt, setObservedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [executedAt, setExecutedAt] = useState(
    new Date(scheduledAt).toISOString().slice(0, 16)
  );
  const [metrics, setMetrics] = useState<Record<string, string>>({});

  const relevantKeys = PLATFORM_METRICS[platformId] || METRIC_LABELS.map((m) => m.key);
  const relevantMetrics = METRIC_LABELS.filter((m) => relevantKeys.includes(m.key));

  const handleSubmit = () => {
    const parsedMetrics: Record<string, number> = {};
    for (const [key, val] of Object.entries(metrics)) {
      if (val && val.trim() !== "") {
        const num = parseInt(val, 10);
        if (!isNaN(num)) parsedMetrics[key] = num;
      }
    }

    startTransition(async () => {
      const result = await recordOutcomeAction({
        queueItemId,
        executedAt: new Date(executedAt),
        observedAt: new Date(observedAt),
        notes: notes || undefined,
        metrics: parsedMetrics,
      });
      if (result.success) {
        toast.success("Outcome recorded.");
        setNotes("");
        setMetrics({});
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to record outcome.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Record Observation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Executed At</label>
            <Input
              type="datetime-local"
              value={executedAt}
              onChange={(e) => setExecutedAt(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Observed At</label>
            <Input
              type="datetime-local"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">Metrics</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {relevantMetrics.map((m) => (
              <div key={m.key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{m.label}</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={metrics[m.key] || ""}
                  onChange={(e) =>
                    setMetrics((prev) => ({ ...prev, [m.key]: e.target.value }))
                  }
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold">Notes</label>
          <Textarea
            placeholder="What happened? Any qualitative observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPending}
            className="min-h-[80px]"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Save Observation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
