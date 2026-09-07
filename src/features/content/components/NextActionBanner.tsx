"use client";

import { useState } from "react";
import Link from "next/link";
import { type NextAction } from "../lib/content-state";
import { AnalyzeButton } from "@/features/content-intelligence/components/AnalyzeButton";
import { PlanGeneratorButton } from "@/features/distribution/components/PlanGeneratorButton";
import { Sparkles } from "lucide-react";
import { MorphIcon } from "morphicons/react";
import { ChevronRight as MorphChevronRight, ArrowRight as MorphArrowRight } from "lucide";

export function NextActionBanner({
  sourceId,
  hasIntelligence,
  nextAction,
}: {
  sourceId: string;
  hasIntelligence: boolean;
  nextAction: NextAction;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            <span>Recommended Next Step</span>
          </div>
          <p className="text-base font-semibold text-foreground">
            {nextAction.label}
          </p>
          <p className="text-sm text-muted-foreground">
            {nextAction.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {nextAction.secondaryAction && (
            <Link
              href={nextAction.secondaryAction.href}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {nextAction.secondaryAction.label}
            </Link>
          )}

          {nextAction.type === "ANALYZE" ? (
            <AnalyzeButton sourceId={sourceId} hasIntelligence={hasIntelligence} />
          ) : nextAction.type === "CREATE_PLAN" ? (
            <PlanGeneratorButton sourceId={sourceId} />
          ) : nextAction.href ? (
            <Link
              href={nextAction.href}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
            >
              <span>{nextAction.label}</span>
              <MorphIcon
                icon={isHovered ? MorphArrowRight : MorphChevronRight}
                className="size-3.5 shrink-0 transition-transform duration-200"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
