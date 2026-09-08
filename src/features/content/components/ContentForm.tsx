"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { createContentSource } from "../actions";
import { contentSourceSchema, type ContentSourceInput } from "../validation";
import { DuoIcon } from "@/components/ui/duo-icon";
import { cn } from "cn";

interface ContentFormProps {
  initialAutoAnalyze?: boolean;
  initialAutoGeneratePlan?: boolean;
}

export function ContentForm({
  initialAutoAnalyze = false,
  initialAutoGeneratePlan = false,
}: ContentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoAnalyze, setAutoAnalyze] = useState(initialAutoAnalyze);
  const [autoGeneratePlan, setAutoGeneratePlan] = useState(initialAutoGeneratePlan);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ContentSourceInput>({
    resolver: zodResolver(contentSourceSchema),
    defaultValues: {
      title: "",
      type: "MARKDOWN",
      rawContent: "",
    },
  });

  const toggleAutoAnalyze = () => {
    const next = !autoAnalyze;
    setAutoAnalyze(next);
    if (!next) {
      setAutoGeneratePlan(false);
    }
  };

  const toggleAutoGeneratePlan = () => {
    const next = !autoGeneratePlan;
    setAutoGeneratePlan(next);
    if (next) {
      setAutoAnalyze(true);
    }
  };

  function onSubmit(values: ContentSourceInput) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("type", values.type);
      formData.append("rawContent", values.rawContent);
      
      const result = await createContentSource(formData, {
        autoAnalyze,
        autoGeneratePlan,
      });
      
      if (result.success && result.id) {
        if (result.planCreated) {
          toast.success("Content saved, analyzed & distribution plan generated!");
          router.push(`/content/${result.id}/distribution`);
        } else if (result.analyzed) {
          toast.success("Content saved & analyzed successfully!");
          router.push(`/content/${result.id}`);
        } else {
          toast.success("Content saved successfully.");
          router.push(`/content/${result.id}`);
        }
      } else {
        toast.error(result.error || "Failed to save content.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          placeholder="Eg: Why I chose Vertical Slice Architecture..." 
          {...register("title")} 
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Content Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEXT">Plain Text</SelectItem>
                <SelectItem value="MARKDOWN">Markdown</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawContent">Content</Label>
        <Textarea
          id="rawContent"
          placeholder="Paste your content here..."
          className="min-h-[300px]"
          {...register("rawContent")}
        />
        {errors.rawContent && <p className="text-sm text-destructive">{errors.rawContent.message}</p>}
      </div>

      {/* Automations section */}
      <div className="rounded-xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DuoIcon name="rocket" className="size-5 text-primary" />
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              Workflow Automations
            </h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-normal">
            Choose what actions run automatically right after saving this content.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div
            onClick={toggleAutoAnalyze}
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none",
              autoAnalyze
                ? "border-primary/60 bg-primary/8 shadow-xs dark:bg-primary/10"
                : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
            )}
          >
            <Checkbox
              checked={autoAnalyze}
              onCheckedChange={toggleAutoAnalyze}
              className="mt-0.5 size-4.5 shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold leading-none text-foreground">
                  1. Auto-Analyze Content
                </span>
                {autoAnalyze && (
                  <span className="text-[11px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Immediately extract themes, ideas, and intelligence after adding.
              </p>
            </div>
          </div>

          <div
            onClick={toggleAutoGeneratePlan}
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer select-none",
              autoGeneratePlan
                ? "border-primary/60 bg-primary/8 shadow-xs dark:bg-primary/10"
                : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
            )}
          >
            <Checkbox
              checked={autoGeneratePlan}
              onCheckedChange={toggleAutoGeneratePlan}
              className="mt-0.5 size-4.5 shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold leading-none text-foreground">
                  2. Auto-Create Distribution Plan
                </span>
                {autoGeneratePlan && (
                  <span className="text-[11px] font-semibold text-primary bg-primary/15 px-2 py-0.5 rounded-full shrink-0">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Immediately synthesize a multi-platform plan once analysis is done.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="min-w-[140px]">
        {isPending && <Spinner className="h-4 w-4 mr-2" />}
        {isPending
          ? autoGeneratePlan
            ? "Saving, analyzing & creating plan..."
            : autoAnalyze
            ? "Saving & analyzing..."
            : "Saving..."
          : autoGeneratePlan
          ? "Save & Generate Plan"
          : autoAnalyze
          ? "Save & Analyze"
          : "Save Content"}
      </Button>
    </form>
  );
}
