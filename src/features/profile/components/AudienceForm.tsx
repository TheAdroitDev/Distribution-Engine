"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createAudience, updateAudience, deleteAudience } from "../actions";
import { audienceSchema, type AudienceInput } from "../validation";
import { PREFERRED_PLATFORMS } from "../constants";

export function AudienceForm({ initialData, audienceId }: { initialData?: Partial<AudienceInput>, audienceId?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<AudienceInput>({
    resolver: zodResolver(audienceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      interests: initialData?.interests || [],
      problems: initialData?.problems || [],
      platformAffinity: initialData?.platformAffinity || [],
    },
  });

  const onSubmit = (values: AudienceInput) => {
    startTransition(async () => {
      const processed = {
        ...values,
        interests: typeof values.interests === 'string' ? (values.interests as string).split(',').map(s => s.trim()).filter(Boolean) : values.interests,
        problems: typeof values.problems === 'string' ? (values.problems as string).split(',').map(s => s.trim()).filter(Boolean) : values.problems,
      };
      const result = audienceId 
        ? await updateAudience(audienceId, processed)
        : await createAudience(processed);
        
      if (result.success) {
        toast.success(`Audience ${audienceId ? 'updated' : 'created'}.`);
        router.refresh();
        if (!audienceId) {
          router.push("/settings/audiences");
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!audienceId || !confirm("Are you sure?")) return;
    startTransition(async () => {
      const result = await deleteAudience(audienceId);
      if (result.success) {
        toast.success("Audience deleted.");
        router.push("/settings/audiences");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register("name")} placeholder="Next.js Developers" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Developers building production web applications..." />
      </div>

      <div className="space-y-2">
        <Label>Interests (comma separated)</Label>
        <Input {...register("interests")} placeholder="React, TypeScript, Architecture" />
      </div>

      <div className="space-y-2">
        <Label>Problems (comma separated)</Label>
        <Input {...register("problems")} placeholder="scaling, performance, maintainability" />
      </div>

      <div className="space-y-2">
        <Label>Platform Affinity</Label>
        <div className="flex flex-wrap gap-2">
          {PREFERRED_PLATFORMS.map((platform) => (
            <label key={platform} className="flex items-center gap-2 border p-2 rounded-md">
              <input type="checkbox" value={platform} {...register("platformAffinity")} />
              <span className="text-sm">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : audienceId ? "Update Audience" : "Create Audience"}
        </Button>
        {audienceId && (
          <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
