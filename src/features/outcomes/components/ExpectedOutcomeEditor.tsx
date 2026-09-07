"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { setExpectedOutcomeAction } from "../actions";
import { useRouter } from "next/navigation";

type Props = {
  queueItemId: string;
  currentExpectedOutcome: string | null;
};

export function ExpectedOutcomeEditor({ queueItemId, currentExpectedOutcome }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentExpectedOutcome || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      const result = await setExpectedOutcomeAction(queueItemId, value || null);
      if (result.success) {
        toast.success("Expected outcome saved.");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save.");
      }
    });
  };

  if (!isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-muted/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Expected Outcome</h3>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            {currentExpectedOutcome ? "Edit" : "Set Expected Outcome"}
          </Button>
        </div>
        {currentExpectedOutcome ? (
          <p className="text-sm text-muted-foreground">{currentExpectedOutcome}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No expected outcome set.</p>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
      <h3 className="text-sm font-semibold">Expected Outcome</h3>
      <Textarea
        placeholder="What do you expect from this distribution action?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isPending}
        className="min-h-[60px]"
        maxLength={500}
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
