import { Card, CardContent } from "@/components/ui/card";
import { DuoIcon } from "@/components/ui/duo-icon";
import { type ExecutionStreak } from "@/features/dashboard/lib/streak";
import { cn } from "@/lib/utils";

interface ExecutionStreakCardProps {
  streak: ExecutionStreak;
  className?: string;
}

export function ExecutionStreakCard({ streak, className }: ExecutionStreakCardProps) {
  const isExtendedToday = streak.status === "ACTIVE_TODAY";
  const isAtRisk = streak.status === "AT_RISK";
  const hasStreak = streak.currentStreak > 0;
  const recentDays = streak.recentDays || [];

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border/80 bg-card/90 transition-all duration-300 shadow-xs flex flex-col justify-between",
        hasStreak && "border-amber-500/30 hover:border-amber-500/50",
        className
      )}
    >
      {/* Subtle warm ambient illumination for active streaks */}
      {hasStreak && (
        <div className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br from-amber-500/15 via-orange-500/8 to-transparent blur-3xl dark:from-amber-500/25 dark:via-orange-500/10" />
      )}

      <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between h-full gap-2.5">
        {/* Top Row: Streak Count Header + Fire Icon Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {streak.currentStreak}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-foreground whitespace-nowrap">
                Day Streak
              </span>
            </div>

            {/* Full Current Date Display */}
            {streak.fullTodayDate && (
              <p className="text-[11.5px] font-semibold text-foreground/90 truncate">
                {streak.fullTodayDate}
              </p>
            )}

            <p className="text-[11px] text-muted-foreground font-medium truncate">
              Your today&apos;s activity count is{" "}
              <span className="font-bold text-foreground">
                {streak.todayExecutions}
              </span>
            </p>
          </div>

          {/* Glowing Duo-Tone Colored Fire Icon Container */}
          <div
            className={cn(
              "relative flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-xs border",
              hasStreak
                ? "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-500/5 border-amber-500/30 text-amber-500 dark:text-amber-400 shadow-amber-500/15"
                : "bg-muted/50 border-border/60 text-muted-foreground/50"
            )}
          >
            {hasStreak && (
              <span className="absolute inset-0 rounded-xl bg-amber-500/10 blur-sm -z-10" />
            )}
            <DuoIcon
              name="fire"
              className={cn(
                "size-6 transition-transform duration-300",
                hasStreak && "scale-105"
              )}
            />
          </div>
        </div>

        {/* Full Current Month Calendar Header & Micro Matrix without numbers */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-0.5">
            <span className="font-semibold text-foreground/85">{streak.currentMonthName || "Current Month"}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/75 font-mono">
              {recentDays.filter((d) => d.hasExecuted).length} active {recentDays.filter((d) => d.hasExecuted).length === 1 ? "day" : "days"}
            </span>
          </div>

          {/* Clean minimal micro-squares without inner numbers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 max-w-[280px]">
            {recentDays.map((day) => {
              const active = day.hasExecuted;
              const isToday = day.isToday;
              const isFuture = day.isFuture;

              return (
                <div
                  key={day.date}
                  title={`${day.fullDateLabel}: ${day.count} action${day.count === 1 ? "" : "s"}${isToday ? " (Today)" : ""}`}
                  className={cn(
                    "size-5 sm:size-[22px] rounded-[4px] transition-all duration-150 border cursor-default group relative",
                    active
                      ? "bg-emerald-500 border-emerald-400/90 shadow-2xs shadow-emerald-500/25 dark:bg-emerald-500 dark:border-emerald-400"
                      : isFuture
                      ? "bg-muted/40 border-border/70 dark:bg-neutral-900/60 dark:border-neutral-700/80 opacity-80"
                      : "bg-muted/50 border-border/60 hover:border-border/90 dark:bg-neutral-900/70 dark:border-neutral-800",
                    isToday && !active && "border-primary ring-1 ring-primary/40 bg-primary/10",
                    isToday && active && "ring-1.5 ring-primary/80"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Footer: Longest Streak & Status Tracker */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <div className="truncate">
            <span>Your longest streak: </span>
            <span className="font-semibold text-foreground">
              {streak.longestStreak} {streak.longestStreak === 1 ? "day" : "days"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "size-1.5 rounded-full",
                isExtendedToday && "bg-emerald-500",
                isAtRisk && "bg-amber-500 animate-pulse",
                !hasStreak && "bg-muted-foreground/40"
              )}
            />
            <span className="font-semibold text-foreground">
              {isExtendedToday
                ? "Active today"
                : isAtRisk
                ? "At risk"
                : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
