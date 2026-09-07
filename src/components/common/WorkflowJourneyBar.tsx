"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type JourneyStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface JourneyStep {
  id: JourneyStepId;
  label: string;
  shortLabel: string;
  description: string;
  getHref?: (context?: { contentId?: string; strategyId?: string; queueItemId?: string }) => string | null;
}

export const WORKFLOW_JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 1,
    label: "Content",
    shortLabel: "Content",
    description: "Source material",
    getHref: (ctx) => (ctx?.contentId ? `/content/${ctx.contentId}` : "/content"),
  },
  {
    id: 2,
    label: "Discover",
    shortLabel: "Discover",
    description: "Insights & ideas",
    getHref: (ctx) => (ctx?.contentId ? `/content/${ctx.contentId}` : "/content"),
  },
  {
    id: 3,
    label: "Plan",
    shortLabel: "Plan",
    description: "Distribution plan",
    getHref: (ctx) => (ctx?.contentId ? `/content/${ctx.contentId}/distribution` : "/plans"),
  },
  {
    id: 4,
    label: "Strategies",
    shortLabel: "Strategies",
    description: "Targeted strategies",
    getHref: (ctx) => (ctx?.contentId ? `/content/${ctx.contentId}/distribution` : "/plans"),
  },
  {
    id: 5,
    label: "Create Assets",
    shortLabel: "Assets",
    description: "Platform copy",
    getHref: (ctx) =>
      ctx?.contentId && ctx?.strategyId
        ? `/content/${ctx.contentId}/distribution/${ctx.strategyId}`
        : "/plans",
  },
  {
    id: 6,
    label: "Queue",
    shortLabel: "Queue",
    description: "Timed execution",
    getHref: () => "/queue",
  },
  {
    id: 7,
    label: "Results (Soon)",
    shortLabel: "Results",
    description: "Coming soon",
    getHref: () => null,
  },
];

interface WorkflowJourneyBarProps {
  currentStep: JourneyStepId;
  completedSteps?: JourneyStepId[];
  contentId?: string;
  strategyId?: string;
  queueItemId?: string;
  compact?: boolean;
  className?: string;
}

export function WorkflowJourneyBar({
  currentStep,
  completedSteps,
  contentId,
  strategyId,
  queueItemId,
  compact = false,
  className,
}: WorkflowJourneyBarProps) {
  // If completedSteps not explicitly provided, treat all steps before currentStep as completed
  const isStepCompleted = (stepId: JourneyStepId) => {
    if (completedSteps) return completedSteps.includes(stepId);
    return stepId < currentStep;
  };

  const currentStepObj = WORKFLOW_JOURNEY_STEPS.find((s) => s.id === currentStep) || WORKFLOW_JOURNEY_STEPS[0];

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/60 p-3 sm:p-4 backdrop-blur-xs shadow-2xs",
        className
      )}
    >
      {/* Mobile view: Compact badge + progress bar */}
      <div className="flex md:hidden flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {currentStep}
            </span>
            <span className="font-semibold text-foreground">{currentStepObj.label}</span>
            <span className="text-muted-foreground text-[11px]">&middot; Step {currentStep} of 7</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono font-medium">
            {Math.round((currentStep / 7) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view: 7-Step horizontal connected flow */}
      <div className="hidden md:flex items-center justify-between gap-1 sm:gap-2">
        {WORKFLOW_JOURNEY_STEPS.map((step, idx) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = isStepCompleted(step.id);
          const isFuture = step.id > currentStep && !isCompleted;
          const href = step.getHref ? step.getHref({ contentId, strategyId, queueItemId }) : null;

          const StepContent = (
            <div
              className={cn(
                "group/step flex items-center gap-2 py-1 px-1.5 rounded-lg transition-all text-left",
                isCurrent && "font-semibold text-foreground",
                isCompleted && "text-muted-foreground hover:text-foreground",
                isFuture && "text-muted-foreground/50"
              )}
            >
              {/* Step indicator node */}
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 shadow-2xs",
                  isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/25 scale-105",
                  isCompleted && "bg-muted-foreground/15 text-foreground border border-border/80 group-hover/step:bg-primary/15 group-hover/step:text-primary",
                  isFuture && "border border-border/60 bg-muted/40 text-muted-foreground/60"
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5 stroke-[2.5]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step label & short subtitle */}
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "text-xs leading-none truncate font-medium",
                    isCurrent && "text-foreground font-semibold",
                    isCompleted && "text-foreground/80",
                    isFuture && "text-muted-foreground/60"
                  )}
                >
                  {compact ? step.shortLabel : step.label}
                </span>
                {!compact && (
                  <span className="text-[10px] text-muted-foreground/70 truncate mt-0.5 leading-tight">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );

          return (
            <div key={step.id} className="flex-1 flex items-center min-w-0">
              {href && isCompleted ? (
                <Link href={href} className="flex-1 min-w-0">
                  {StepContent}
                </Link>
              ) : (
                <div className="flex-1 min-w-0">{StepContent}</div>
              )}

              {/* Connecting line */}
              {idx < WORKFLOW_JOURNEY_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-1 transition-colors",
                    isStepCompleted((step.id + 1) as JourneyStepId) || step.id < currentStep
                      ? "bg-primary/50"
                      : "bg-border/60"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
