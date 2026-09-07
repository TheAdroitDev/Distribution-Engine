"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { saveAssetAction, generateAssetAction } from "../actions";
import { addToQueueAction } from "@/features/queue/actions";
import type { DistributionAsset } from "../schemas/asset-schema";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfToday, isToday, isBefore, addHours, addMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { MorphIcon } from "morphicons/react";
import { Copy, Check } from "lucide";

export function AssetEditor({ 
  asset, 
  strategyId,
  platformName
}: { 
  asset?: DistributionAsset; 
  strategyId: string;
  platformName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(asset?.title || "");
  const [body, setBody] = useState(asset?.body || "");
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState<string>(() => {
    return format(addHours(new Date(), 1), "HH:00");
  });
  const [copied, setCopied] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const router = useRouter();

  const today = startOfToday();

  // Validate that selected date + time is strictly in the future
  const isPastTime = Boolean(
    scheduleDate &&
      (() => {
        const now = new Date();
        if (isBefore(scheduleDate, today)) return true;
        if (isToday(scheduleDate)) {
          const [hours, minutes] = scheduleTime.split(":").map(Number);
          const currentH = now.getHours();
          const currentM = now.getMinutes();
          return hours < currentH || (hours === currentH && minutes < currentM);
        }
        return false;
      })()
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    setScheduleDate(newDate);
    if (newDate && isToday(newDate)) {
      const now = new Date();
      const [h, m] = scheduleTime.split(":").map(Number);
      if (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes())) {
        setScheduleTime(format(addMinutes(now, 15), "HH:mm"));
      }
    }
  };

  const handleQueue = () => {
    if (!scheduleDate || isPastTime) return;
    startTransition(async () => {
      const scheduledDateTime = new Date(scheduleDate);
      if (scheduleTime) {
        const [hours, minutes] = scheduleTime.split(":").map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          scheduledDateTime.setHours(hours, minutes, 0, 0);
        }
      }

      if (scheduledDateTime.getTime() <= Date.now()) {
        toast.error("Please choose a future date and time.");
        return;
      }

      const result = await addToQueueAction(strategyId, scheduledDateTime);
      if (result.success) {
        toast.success("Added to queue!");
        router.push("/queue");
      } else {
        toast.error(result.error || "Failed to add to queue.");
      }
    });
  };

  const handleGenerate = () => {
    setRegenerateOpen(false);
    startTransition(async () => {
      const result = await generateAssetAction(strategyId, asset?.body);
      if (result.success) {
        toast.success("Asset generated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to generate asset.");
      }
    });
  };

  const handleSave = () => {
    if (!asset) return;
    startTransition(async () => {
      const result = await saveAssetAction(asset.id, { title, body });
      if (result.success) {
        toast.success("Asset saved as READY.");
      } else {
        toast.error(result.error || "Failed to save asset.");
      }
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!asset) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Asset</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="mb-4 text-center">No asset generated yet for {platformName}.</p>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? <><Spinner className="mr-2 h-4 w-4" /> Generating...</> : "Generate Asset"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Asset <span className={`ml-2 text-xs px-2 py-1 rounded border ${asset.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{asset.status}</span></CardTitle>
          <div className="flex gap-2">
            <AlertDialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
              <AlertDialogTrigger render={<Button variant="outline" size="sm" disabled={isPending}>{isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}Regenerate</Button>} />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will {asset.status === "READY" ? "archive your current READY asset and create a new DRAFT" : "overwrite the current draft"}. Do you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleGenerate}>Regenerate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" onClick={handleSave} disabled={isPending || asset.status === "READY"}>
              {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {asset.status === "READY" ? "Saved" : "Save as READY"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {asset.status === 'DRAFT' && (
          <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-md border border-yellow-200 font-medium">
            This is an AI-generated draft. Please review and edit before saving as READY.
          </div>
        )}
        {asset.title !== null && (
          <div className="space-y-1">
            <label className="text-sm font-semibold">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              disabled={isPending}
            />
          </div>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">Body</label>
            <button 
              onClick={handleCopy} 
              aria-expanded={copied} 
              className="text-muted-foreground hover:text-foreground p-1 transition-colors bg-muted rounded-md flex items-center justify-center w-8 h-8"
              title="Copy to clipboard"
            >
              <MorphIcon icon={copied ? Check : Copy} className="w-5 h-5 text-current" />
            </button>
          </div>
          <Textarea 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            disabled={isPending}
            className="min-h-[200px]"
          />
        </div>

        {asset.metadata?.items && asset.metadata.items.length > 0 && (
          <div className="space-y-2 mt-4 p-4 bg-muted/30 rounded-md">
            <h4 className="text-sm font-semibold">Additional Thread Items (Read-only Preview)</h4>
            {asset.metadata.items.map((item, idx) => (
              <div key={idx} className="text-sm p-3 border rounded-md bg-background">
                {item}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Thread editing is not fully supported in V1.</p>
          </div>
        )}
      </CardContent>
      {asset.status === "READY" && (
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold block mb-1">Schedule for</label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger render={
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !scheduleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    } />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={handleDateSelect}
                        disabled={{ before: today }}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="relative flex items-center">
                    <Clock className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="time"
                      value={scheduleTime}
                      min={scheduleDate && isToday(scheduleDate) ? format(new Date(), "HH:mm") : undefined}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className={cn(
                        "w-[120px] pl-8 h-9 text-sm font-normal",
                        isPastTime && "border-destructive focus-visible:ring-destructive/30"
                      )}
                      title="Select time"
                    />
                  </div>
                </div>
                {isPastTime && (
                  <p className="text-[11px] text-destructive font-medium mt-1">
                    Scheduled time must be in the future.
                  </p>
                )}
              </div>
              <div className="self-end pb-0.5">
                <Button onClick={handleQueue} disabled={isPending || !scheduleDate || isPastTime}>
                  {isPending ? <Spinner className="h-4 w-4 mr-2" /> : null}
                  Add to Queue
                </Button>
              </div>
          </div>
        </div>
      )}
    </Card>
  );
}
