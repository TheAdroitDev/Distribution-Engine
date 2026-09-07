"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import {
  INBUILT_AUDIENCE_PRESETS,
  ONBOARDING_GOALS,
  ONBOARDING_PLATFORMS,
  ONBOARDING_PROMOTION_TOLERANCES,
  ONBOARDING_AUTOMATIONS,
} from "../constants";
import { submitOnboardingQuestionnaire, skipOnboarding } from "../actions";
import { toast } from "@/components/ui/toast";
import { DuoIcon } from "@/components/ui/duo-icon";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { MorphIcon } from "morphicons/react";
import { ChevronRight as MorphChevronRight, ArrowRight as MorphArrowRight } from "lucide";

interface OnboardingQuestionnaireDialogProps {
  defaultOpen?: boolean;
}

function MorphingNextButton({
  disabled,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <QuestionnaireNext
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className ?? "gap-1.5 cursor-pointer"}
    >
      <span>Next</span>
      <MorphIcon
        icon={isHovered ? MorphArrowRight : MorphChevronRight}
        className="size-3.5 shrink-0 transition-transform duration-200"
      />
    </QuestionnaireNext>
  );
}

export function OnboardingQuestionnaireDialog({
  defaultOpen = false,
}: OnboardingQuestionnaireDialogProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  // Multi-step form state
  const [selectedAudiences, setSelectedAudiences] = React.useState<string[]>([
    "nextjs_engineers",
    "ai_engineers",
  ]);
  const [primaryGoal, setPrimaryGoal] = React.useState<string>("AUTHORITY");
  const [preferredPlatforms, setPreferredPlatforms] = React.useState<string[]>([
    "x",
    "linkedin",
  ]);
  const [promotionTolerance, setPromotionTolerance] = React.useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM"
  );
  const [automations, setAutomations] = React.useState<string[]>([
    "auto_analyze",
    "auto_generate_plan",
  ]);

  const handleAudienceToggle = (id: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePlatformToggle = (id: string) => {
    setPreferredPlatforms((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAutomationToggle = (id: string) => {
    setAutomations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitOnboardingQuestionnaire({
        selectedAudienceIds: selectedAudiences,
        primaryGoal,
        preferredPlatforms,
        promotionTolerance,
        automations,
      });

      if (res.success) {
        // Trigger celebratory confetti when user finishes onboarding setup
        try {
          const count = 200;
          const defaults = {
            origin: { y: 0.7 },
            zIndex: 99999,
          };

          const fireConfetti = (particleRatio: number, opts: confetti.Options) => {
            confetti({
              ...defaults,
              ...opts,
              particleCount: Math.floor(count * particleRatio),
            });
          };

          fireConfetti(0.25, {
            spread: 26,
            startVelocity: 55,
          });
          fireConfetti(0.2, {
            spread: 60,
          });
          fireConfetti(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
          });
          fireConfetti(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
          });
          fireConfetti(0.1, {
            spread: 120,
            startVelocity: 45,
          });
        } catch {
          // Ignore confetti errors if canvas not supported
        }

        toast.success("Workspace setup complete!", {
          description: "Your distribution profile and inbuilt audiences have been initialized.",
        });
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to complete setup.");
      }
    } catch {
      toast.error("An unexpected error occurred while saving your preferences.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await skipOnboarding();
      setOpen(false);
      router.refresh();
    } catch {
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 gap-5 border border-border/80 bg-background shadow-2xl"
      >
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
                <DuoIcon name="rocket" className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Welcome to Distribution Engine
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Configure your distribution preferences in a few quick steps.
                </DialogDescription>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg border border-border/50 hover:bg-muted/60 shrink-0"
            >
              Skip
            </Button>
          </div>
        </DialogHeader>

        <Questionnaire
          defaultItem="audiences"
          items={[
            { name: "audiences", required: true },
            { name: "goal", required: true },
            { name: "platforms", required: true },
            { name: "promotion", required: true },
            { name: "automations", required: true },
          ]}
          className="space-y-4"
        >
          {/* Custom Progress Render State on top of the text/title */}
          <QuestionnaireProgress
            className="w-full"
            render={(_, state) => (
              <div className="w-full space-y-2 pb-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="text-foreground font-semibold">
                    Question {state.current} of {state.total}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {Math.round((state.current / state.total) * 100)}% completed
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60 border border-border/40">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(state.current / state.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          />

          {/* Question 1: Inbuilt Audience Selection */}
          <QuestionnaireItem name="audiences" multiple>
            <div className="space-y-1">
              <QuestionnaireTitle className="text-base sm:text-lg font-bold text-foreground">
                Who is your target audience?
              </QuestionnaireTitle>
              <QuestionnaireDescription className="text-xs sm:text-sm text-muted-foreground">
                Select one or more inbuilt audience profiles to automatically pre-populate into your account.
              </QuestionnaireDescription>
            </div>

            <QuestionnaireChoices className="grid gap-2.5 pt-1">
              {INBUILT_AUDIENCE_PRESETS.map((preset) => {
                const checked = selectedAudiences.includes(preset.id);
                return (
                  <QuestionnaireChoice
                    key={preset.id}
                    value={preset.id}
                    checked={checked}
                    onChange={() => handleAudienceToggle(preset.id)}
                    className="w-full p-3.5 sm:p-4 rounded-xl items-start gap-3 border transition-all hover:bg-muted/40 data-checked:border-primary/50 data-checked:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {preset.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-semibold py-0.5 shrink-0">
                          {preset.badge}
                        </Badge>
                      </div>
                      <QuestionnaireChoiceDescription className="text-xs text-muted-foreground leading-relaxed">
                        {preset.description}
                      </QuestionnaireChoiceDescription>
                    </div>
                  </QuestionnaireChoice>
                );
              })}
            </QuestionnaireChoices>

            <QuestionnaireActions className="pt-3 border-t border-border/60">
              <QuestionnaireSkip onClick={handleSkip} disabled={isSubmitting}>
                Skip
              </QuestionnaireSkip>
              <MorphingNextButton disabled={isSubmitting} />
            </QuestionnaireActions>
          </QuestionnaireItem>

          {/* Question 2: Primary Goal */}
          <QuestionnaireItem name="goal">
            <div className="space-y-1">
              <QuestionnaireTitle className="text-base sm:text-lg font-bold text-foreground">
                What is your primary goal?
              </QuestionnaireTitle>
              <QuestionnaireDescription className="text-xs sm:text-sm text-muted-foreground">
                Pick what matters most right now to guide your distribution strategy.
              </QuestionnaireDescription>
            </div>

            <QuestionnaireChoices className="grid gap-2.5 pt-1">
              {ONBOARDING_GOALS.map((goal) => {
                const checked = primaryGoal === goal.id;
                return (
                  <QuestionnaireChoice
                    key={goal.id}
                    value={goal.id}
                    checked={checked}
                    onChange={() => setPrimaryGoal(goal.id)}
                    className="w-full p-3.5 sm:p-4 rounded-xl items-start gap-3 border transition-all hover:bg-muted/40 data-checked:border-primary/50 data-checked:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-sm text-foreground">
                        {goal.title}
                      </span>
                      <QuestionnaireChoiceDescription className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                        {goal.description}
                      </QuestionnaireChoiceDescription>
                    </div>
                  </QuestionnaireChoice>
                );
              })}
            </QuestionnaireChoices>

            <QuestionnaireActions className="pt-3 border-t border-border/60">
              <QuestionnairePrevious />
              <QuestionnaireSkip onClick={handleSkip} disabled={isSubmitting}>
                Skip
              </QuestionnaireSkip>
              <MorphingNextButton disabled={isSubmitting} />
            </QuestionnaireActions>
          </QuestionnaireItem>

          {/* Question 3: Preferred Platforms */}
          <QuestionnaireItem name="platforms" multiple>
            <div className="space-y-1">
              <QuestionnaireTitle className="text-base sm:text-lg font-bold text-foreground">
                Where do you plan to distribute?
              </QuestionnaireTitle>
              <QuestionnaireDescription className="text-xs sm:text-sm text-muted-foreground">
                Choose your primary platforms for tailored strategy and asset generation.
              </QuestionnaireDescription>
            </div>

            <QuestionnaireChoices className="grid sm:grid-cols-2 gap-2.5 pt-1">
              {ONBOARDING_PLATFORMS.map((platform) => {
                const checked = preferredPlatforms.includes(platform.id);
                return (
                  <QuestionnaireChoice
                    key={platform.id}
                    value={platform.id}
                    checked={checked}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="w-full p-3.5 rounded-xl items-start gap-3 border transition-all hover:bg-muted/40 data-checked:border-primary/50 data-checked:bg-primary/5 h-full cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-sm sm:text-[14.5px] text-foreground">
                        {platform.name}
                      </span>
                      <QuestionnaireChoiceDescription className="text-xs sm:text-[13px] text-muted-foreground/90 font-normal leading-relaxed">
                        {platform.desc}
                      </QuestionnaireChoiceDescription>
                    </div>
                  </QuestionnaireChoice>
                );
              })}
            </QuestionnaireChoices>

            <QuestionnaireActions className="pt-3 border-t border-border/60">
              <QuestionnairePrevious />
              <QuestionnaireSkip onClick={handleSkip} disabled={isSubmitting}>
                Skip
              </QuestionnaireSkip>
              <MorphingNextButton disabled={isSubmitting} />
            </QuestionnaireActions>
          </QuestionnaireItem>

          {/* Question 4: Promotion Tolerance */}
          <QuestionnaireItem name="promotion">
            <div className="space-y-1">
              <QuestionnaireTitle className="text-base sm:text-lg font-bold text-foreground">
                What is your promotion tolerance?
              </QuestionnaireTitle>
              <QuestionnaireDescription className="text-xs sm:text-sm text-muted-foreground">
                Controls how assertively generated assets pitch your links and product vs. pure value.
              </QuestionnaireDescription>
            </div>

            <QuestionnaireChoices className="grid gap-2.5 pt-1">
              {ONBOARDING_PROMOTION_TOLERANCES.map((item) => {
                const checked = promotionTolerance === item.id;
                return (
                  <QuestionnaireChoice
                    key={item.id}
                    value={item.id}
                    checked={checked}
                    onChange={() => setPromotionTolerance(item.id as "LOW" | "MEDIUM" | "HIGH")}
                    className="w-full p-3.5 sm:p-4 rounded-xl items-start gap-3 border transition-all hover:bg-muted/40 data-checked:border-primary/50 data-checked:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {item.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-semibold py-0.5">
                          {item.badge}
                        </Badge>
                      </div>
                      <QuestionnaireChoiceDescription className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                        {item.description}
                      </QuestionnaireChoiceDescription>
                    </div>
                  </QuestionnaireChoice>
                );
              })}
            </QuestionnaireChoices>

            <QuestionnaireActions className="pt-3 border-t border-border/60">
              <QuestionnairePrevious />
              <QuestionnaireSkip onClick={handleSkip} disabled={isSubmitting}>
                Skip
              </QuestionnaireSkip>
              <MorphingNextButton disabled={isSubmitting} />
            </QuestionnaireActions>
          </QuestionnaireItem>

          {/* Question 5: Workflow Automations */}
          <QuestionnaireItem name="automations" multiple>
            <div className="space-y-1">
              <QuestionnaireTitle className="text-base sm:text-lg font-bold text-foreground">
                Workflow Automations
              </QuestionnaireTitle>
              <QuestionnaireDescription className="text-xs sm:text-sm text-muted-foreground">
                Choose automated actions to execute instantly whenever new content is added.
              </QuestionnaireDescription>
            </div>

            <QuestionnaireChoices className="grid gap-2.5 pt-1">
              {ONBOARDING_AUTOMATIONS.map((automation) => {
                const checked = automations.includes(automation.id);
                return (
                  <QuestionnaireChoice
                    key={automation.id}
                    value={automation.id}
                    checked={checked}
                    onChange={() => handleAutomationToggle(automation.id)}
                    className="w-full p-3.5 sm:p-4 rounded-xl items-start gap-3 border transition-all hover:bg-muted/40 data-checked:border-primary/50 data-checked:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {automation.title}
                        </span>
                        {checked && (
                          <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                            Enabled
                          </span>
                        )}
                      </div>
                      <QuestionnaireChoiceDescription className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                        {automation.description}
                      </QuestionnaireChoiceDescription>
                    </div>
                  </QuestionnaireChoice>
                );
              })}
            </QuestionnaireChoices>

            <QuestionnaireActions className="pt-3 border-t border-border/60">
              <QuestionnairePrevious />
              <QuestionnaireSubmit
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting && <Spinner className="size-3.5" />}
                <span>{isSubmitting ? "Configuring..." : "Complete Setup"}</span>
              </QuestionnaireSubmit>
            </QuestionnaireActions>
          </QuestionnaireItem>
        </Questionnaire>
      </DialogContent>
    </Dialog>
  );
}
