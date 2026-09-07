"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { DuoIcon } from "@/components/ui/duo-icon";
import { updateProfile } from "../actions";
import { profileSchema, type ProfileInput } from "../validation";
import { DISTRIBUTION_GOALS, PREFERRED_PLATFORMS, PROMOTION_TOLERANCES } from "../constants";
import { cn } from "cn";

export function ProfileForm({ initialData }: { initialData?: Partial<ProfileInput> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      expertise: initialData?.expertise || [],
      topics: initialData?.topics || [],
      preferredPlatforms: initialData?.preferredPlatforms || [],
      primaryGoal: initialData?.primaryGoal || "",
      secondaryGoals: initialData?.secondaryGoals || [],
      promotionTolerance: initialData?.promotionTolerance || undefined,
      contentPreferences: initialData?.contentPreferences || [],
      voicePreferences: initialData?.voicePreferences || { tone: "", verbosity: "" },
      autoAnalyze: initialData?.autoAnalyze ?? false,
      autoGeneratePlan: initialData?.autoGeneratePlan ?? false,
    },
  });

  const onSubmit = (values: ProfileInput) => {
    startTransition(async () => {
      const result = await updateProfile({
        ...values,
        expertise: typeof values.expertise === 'string' ? (values.expertise as string).split(',').map(s => s.trim()).filter(Boolean) : values.expertise,
        topics: typeof values.topics === 'string' ? (values.topics as string).split(',').map(s => s.trim()).filter(Boolean) : values.topics,
        contentPreferences: typeof values.contentPreferences === 'string' ? (values.contentPreferences as string).split(',').map(s => s.trim()).filter(Boolean) : values.contentPreferences,
      });
      if (result.success) {
        toast.success("Profile updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const goalOptions = DISTRIBUTION_GOALS.map((goal) => ({
    value: goal.id,
    label: `${goal.name} - ${goal.description}`,
  }));

  const promotionOptions = PROMOTION_TOLERANCES.map((tol) => ({
    value: tol,
    label: tol === "LOW"
      ? "LOW - Subtle / Organic (Minimal direct promotion)"
      : tol === "MEDIUM"
      ? "MEDIUM - Balanced (Clear value with organic CTAs)"
      : "HIGH - High Promo (Direct, proactive self-promotion)",
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Expertise (comma separated)</Label>
          <Input {...register("expertise")} placeholder="Next.js, React, Architecture..." />
        </div>
        <div className="space-y-2">
          <Label>Topics (comma separated)</Label>
          <Input {...register("topics")} placeholder="AI agents, Developer tools..." />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferred Platforms</Label>
        <div className="flex flex-wrap gap-2">
          {PREFERRED_PLATFORMS.map((platform) => (
            <Controller
              key={platform}
              name="preferredPlatforms"
              control={control}
              render={({ field }) => {
                return (
                  <label className="flex items-center gap-2 border p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={field.value?.includes(platform)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...(field.value || []), platform])
                          : field.onChange(field.value?.filter((value) => value !== platform))
                      }}
                    />
                    <span className="text-sm">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </label>
                );
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Primary Goal</Label>
        <Controller
          name="primaryGoal"
          control={control}
          render={({ field }) => {
            const currentItem = goalOptions.find((g) => g.value === field.value) || null;
            return (
              <Combobox
                items={goalOptions}
                value={currentItem}
                onValueChange={(item: { value: string; label: string } | null) => {
                  field.onChange(item ? item.value : "");
                }}
              >
                <ComboboxInput placeholder="Select or search a goal..." />
                <ComboboxContent>
                  <ComboboxEmpty>No goals found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: { value: string; label: string }) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            );
          }}
        />
      </div>

      <div className="space-y-2">
        <Label>Voice Preferences (Tone)</Label>
        <Input {...register("voicePreferences.tone")} placeholder="Casual, Professional, Witty..." />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Promotion Tolerance</Label>
          <Tooltip>
            <TooltipTrigger type="button" className="inline-flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground">
              <DuoIcon name="question" size={15} className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-normal">
              Controls how directly the generated assets and strategies promote your product/links vs. focusing purely on value, lessons, or education (Low: subtle & minimal promo; Medium: balanced value with clear CTAs; High: direct & assertive self-promotion).
            </TooltipContent>
          </Tooltip>
        </div>
        <Controller
          name="promotionTolerance"
          control={control}
          render={({ field }) => {
            const currentItem = promotionOptions.find((p) => p.value === field.value) || null;
            return (
              <Combobox
                items={promotionOptions}
                value={currentItem}
                onValueChange={(item: { value: string; label: string } | null) => {
                  field.onChange(item ? item.value : null);
                }}
              >
                <ComboboxInput placeholder="Select or search promotion tolerance..." />
                <ComboboxContent>
                  <ComboboxEmpty>No options found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item: { value: string; label: string }) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            );
          }}
        />
      </div>

      {/* Automation preferences */}
      <div className="rounded-xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DuoIcon name="rocket" className="size-5 text-primary" />
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Workflow Automations
            </h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-normal">
            Configure automated actions to execute immediately when new content is added.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Controller
            name="autoAnalyze"
            control={control}
            render={({ field }) => (
              <div
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none",
                  field.value
                    ? "border-primary/60 bg-primary/8 shadow-xs dark:bg-primary/10"
                    : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                )}
              >
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 size-4.5 shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold leading-none text-foreground">
                      1. Auto-Analyze Content
                    </span>
                    {field.value && (
                      <span className="text-[11px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Automatically analyze and extract themes, ideas, and intelligence immediately after adding content.
                  </p>
                </div>
              </div>
            )}
          />

          <Controller
            name="autoGeneratePlan"
            control={control}
            render={({ field }) => (
              <div
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none",
                  field.value
                    ? "border-primary/60 bg-primary/8 shadow-xs dark:bg-primary/10"
                    : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                )}
              >
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 size-4.5 shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold leading-none text-foreground">
                      2. Auto-Create Distribution Plan
                    </span>
                    {field.value && (
                      <span className="text-[11px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Automatically synthesize cross-platform distribution strategies once analysis completes.
                  </p>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
        {isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
