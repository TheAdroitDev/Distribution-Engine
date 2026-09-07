"use client";

import { useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLATFORMS } from "@/features/platforms/definitions";
import { updateStrategyStatus } from "../actions";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

export function StrategyCard({ strategy, index, contentSourceId }: { strategy: Record<string, unknown> & { id: string; status: string; score: number; platformId: string; rationale: string; angle: string; idea: { title: string }; audience: { name: string }; formatId: string; actionId: string; planId: string; assets: { id: string, status: string }[] }; index: number; contentSourceId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (status: "ACCEPTED" | "REJECTED") => {
    startTransition(async () => {
      const result = await updateStrategyStatus(strategy.id, status);
      if (result.success) {
        toast.success(`Strategy ${status.toLowerCase()}.`);
      } else {
        toast.error(result.error || "Failed to update status.");
      }
    });
  };

  const platform = PLATFORMS[strategy.platformId as keyof typeof PLATFORMS];

  // Determine asset state
  const activeAsset = strategy.assets?.find(a => a.status === 'READY') || strategy.assets?.find(a => a.status === 'DRAFT');
  
  let ctaText = "Create Asset";
  if (activeAsset) {
    if (activeAsset.status === 'DRAFT') ctaText = "View Draft Asset";
    if (activeAsset.status === 'READY') ctaText = "View Asset";
  }

  return (
    <Card className={`flex flex-col relative ${strategy.status === 'REJECTED' ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {index}. {platform?.name || strategy.platformId}
          </CardTitle>
          <div className="flex gap-2">
            <span className="text-xs font-semibold bg-muted px-2 py-1 rounded-md border">Score: {strategy.score}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
              strategy.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
              strategy.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {strategy.status}
            </span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span><strong>Idea:</strong> {strategy.idea.title}</span>
          <span><strong>Audience:</strong> {strategy.audience.name}</span>
          <span><strong>Format:</strong> {strategy.formatId}</span>
          <span><strong>Action:</strong> {strategy.actionId}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Why this works:</h4>
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border-l-2 border-primary/40">
            {strategy.rationale}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold mb-1">Recommended Angle:</h4>
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border-l-2 border-primary/40">
            {strategy.angle}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t p-4 bg-muted/10">
        <Button 
          variant="outline" 
          onClick={() => handleStatusUpdate("REJECTED")} 
          disabled={isPending || strategy.status === "REJECTED"}
        >
          Reject
        </Button>
        {strategy.status === "ACCEPTED" ? (
          <Link
            href={`/content/${contentSourceId}/distribution/${strategy.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium h-8 gap-1.5 px-2.5 bg-primary text-primary-foreground hover:bg-primary/80 transition-all"
          >
            {ctaText}
          </Link>
        ) : (
          <Button 
            onClick={() => handleStatusUpdate("ACCEPTED")} 
            disabled={isPending || strategy.status === "ACCEPTED"}
          >
            Accept
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
