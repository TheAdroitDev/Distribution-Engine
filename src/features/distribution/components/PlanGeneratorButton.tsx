"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { createDistributionPlan } from "../actions";
import { Spinner } from "@/components/ui/spinner";

export function PlanGeneratorButton({ sourceId }: { sourceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await createDistributionPlan(sourceId);
      if (result.success) {
        toast.success("Distribution plan created!");
        router.push(`/content/${sourceId}/distribution`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Button onClick={handleGenerate} disabled={isPending}>
      {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
      {isPending ? "Generating Strategy..." : "Create Distribution Plan"}
    </Button>
  );
}
