"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { MorphIcon } from "morphicons/react";
import { ChevronRight as MorphChevronRight, ArrowRight as MorphArrowRight } from "lucide";
import { cn } from "@/lib/utils";

export type JourneyStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface NextAction {
  title: string;
  description: string;
  step: JourneyStepId;
  stepName: string;
  ctaLabel: string;
  ctaHref: string;
  sourceTitle?: string | null;
  contentId?: string;
  strategyId?: string;
}

export interface PipelineStats {
  totalSources: number;
  analyzedSources: number;
  totalPlans: number;
  acceptedStrategies: number;
  readyAssets: number;
  pendingQueueItems: number;
  completedResults: number;
}

interface NextActionCardProps {
  action: NextAction;
  pipeline: PipelineStats;
  className?: string;
}

export function NextActionCard({
  action,
  pipeline,
  className,
}: NextActionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/80 bg-card/95 shadow-sm flex flex-col justify-between transition-all",
        className
      )}
    >
      {/* Decorative ambient subtle radial backdrop */}
      <div className="pointer-events-none absolute -top-20 -left-20 size-64 rounded-full bg-primary/8 blur-3xl dark:bg-primary/10" />

      <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full gap-5">
        {/* Top Header Row: Recommended Action Badge + Source Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold text-xs tracking-wide shadow-2xs">
              <Sparkles className="size-3.5 shrink-0" />
              <span>Recommended Action</span>
            </span>
          </div>

          {action.sourceTitle && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground max-w-sm truncate bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
              <span className="text-muted-foreground/75 font-medium">Source:</span>
              <span className="font-semibold text-foreground truncate" title={action.sourceTitle}>
                {action.sourceTitle}
              </span>
            </div>
          )}
        </div>

        {/* Main Action Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 py-1">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {action.title}
            </h2>
            <p className="text-sm sm:text-[14.5px] text-muted-foreground leading-relaxed">
              {action.description}
            </p>
          </div>

          {/* Primary CTA Button with MorphIcon */}
          <div className="shrink-0 flex items-center">
            <Link
              href={action.ctaHref}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Button
                size="lg"
                className="h-11 px-6 rounded-xl font-bold text-sm shadow-sm gap-2 group cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-md"
              >
                <span>{action.ctaLabel}</span>
                <MorphIcon
                  icon={isHovered ? MorphArrowRight : MorphChevronRight}
                  className="size-4 shrink-0 transition-transform duration-200"
                />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Pipeline Progress Metrics Strip */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60">
          <div className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Accepted Strategies
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground mt-1">
              {pipeline.acceptedStrategies}
            </span>
          </div>

          <div className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ready Assets
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground mt-1">
              {pipeline.readyAssets}
            </span>
          </div>

          <div className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Queue
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground mt-1">
              {pipeline.pendingQueueItems}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
