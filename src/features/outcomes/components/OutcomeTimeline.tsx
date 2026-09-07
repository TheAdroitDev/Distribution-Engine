"use client";

import { format } from "date-fns";

type OutcomeEntry = {
  id: string;
  observedAt: Date;
  executedAt: Date;
  notes: string | null;
  metrics: Record<string, number>;
};

type OutcomeTimelineProps = {
  expectedOutcome: string | null;
  outcomes: OutcomeEntry[];
};

export function OutcomeTimeline({ expectedOutcome, outcomes }: OutcomeTimelineProps) {
  return (
    <div className="space-y-4">
      {expectedOutcome && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold mb-1">Expected Outcome</h4>
          <p className="text-sm">{expectedOutcome}</p>
        </div>
      )}

      {outcomes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No observations recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {outcomes.map((outcome) => {
            const metricEntries = Object.entries(outcome.metrics).filter(
              ([, v]) => v !== undefined && v > 0
            );

            return (
              <div
                key={outcome.id}
                className="border rounded-lg p-4 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {format(new Date(outcome.observedAt), "MMM d, yyyy")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Executed: {format(new Date(outcome.executedAt), "MMM d")}
                  </span>
                </div>

                {metricEntries.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {metricEntries.map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}

                {outcome.notes && (
                  <p className="text-sm text-muted-foreground italic border-l-2 pl-3 py-1">
                    {outcome.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
