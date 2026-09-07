"use client";

import { useState, useTransition } from "react";
import { analyzeContentSource } from "../actions";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

export function AnalyzeButton({ sourceId, hasIntelligence }: { sourceId: string, hasIntelligence: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleAnalyze = () => {
    setOpen(false);
    startTransition(async () => {
      const result = await analyzeContentSource(sourceId);
      if (result.success) {
        toast.success("Content analyzed successfully!");
      } else {
        toast.error(result.error || "Failed to analyze content.");
      }
    });
  };

  if (hasIntelligence) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={
          <Button variant="outline" size="sm" disabled={isPending}>
            {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
            {isPending ? "Analyzing..." : "Re-analyze"}
          </Button>
        } />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will re-analyze the content. It will update content intelligence and regenerate your distribution plan. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAnalyze}>Re-analyze</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button 
      onClick={handleAnalyze} 
      disabled={isPending} 
      variant="default"
      size="sm"
    >
      {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
      {isPending ? "Analyzing..." : "Analyze"}
    </Button>
  );
}
