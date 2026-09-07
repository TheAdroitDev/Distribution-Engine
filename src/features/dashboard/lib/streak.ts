import { db } from "@/lib/db";
import { contentSources, distributionPlans, distributionAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format, subDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export type StreakStatus = 'ACTIVE_TODAY' | 'AT_RISK' | 'INACTIVE';

export type StreakDay = {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1..31
  count: number;
  hasExecuted: boolean;
  isToday: boolean;
  isFuture: boolean;
  fullDateLabel: string; // e.g., "Monday, September 7, 2026"
  shortDateLabel: string; // e.g., "Sep 7"
};

export type ExecutionStreak = {
  currentStreak: number;
  longestStreak: number;
  hasExecutedToday: boolean;
  status: StreakStatus;
  lastExecutedDate: string | null;
  totalExecutions: number;
  todayExecutions: number;
  currentMonthName: string; // e.g., "September 2026"
  fullTodayDate: string; // e.g., "Monday, September 7, 2026"
  recentDays: StreakDay[]; // Days of the current full month
};

/**
 * Pure calculation helper to derive streak metrics from a list of activity dates.
 * Dates should be provided as ISO date strings or Date objects.
 */
export function computeStreakMetrics(
  dates: Array<Date | string>,
  referenceDate: Date = new Date()
): ExecutionStreak {
  const todayStr = format(referenceDate, 'yyyy-MM-dd');
  const currentMonthName = format(referenceDate, 'MMMM yyyy');
  const fullTodayDate = format(referenceDate, 'EEEE, MMMM d, yyyy');
  const countsByDay: Record<string, number> = {};

  for (const d of dates) {
    try {
      const parsed = typeof d === 'string' ? new Date(d) : d;
      if (!isNaN(parsed.getTime())) {
        const dayKey = format(parsed, 'yyyy-MM-dd');
        countsByDay[dayKey] = (countsByDay[dayKey] || 0) + 1;
      }
    } catch {
      // Ignore unparseable dates
    }
  }

  const todayExecutions = countsByDay[todayStr] || 0;

  // Generate all calendar days for the current month
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const recentDays: StreakDay[] = daysInMonth.map((dayDate) => {
    const dayKey = format(dayDate, 'yyyy-MM-dd');
    const count = countsByDay[dayKey] || 0;
    const isToday = dayKey === todayStr;
    const isFuture = startOfDay(dayDate).getTime() > startOfDay(referenceDate).getTime();

    return {
      date: dayKey,
      dayNumber: dayDate.getDate(),
      count,
      hasExecuted: count > 0,
      isToday,
      isFuture,
      fullDateLabel: format(dayDate, 'EEEE, MMMM d, yyyy'),
      shortDateLabel: format(dayDate, 'MMM d'),
    };
  });

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasExecutedToday: false,
      status: 'INACTIVE',
      lastExecutedDate: null,
      totalExecutions: 0,
      todayExecutions: 0,
      currentMonthName,
      fullTodayDate,
      recentDays,
    };
  }

  const sortedDays = Object.keys(countsByDay).sort();
  if (sortedDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasExecutedToday: false,
      status: 'INACTIVE',
      lastExecutedDate: null,
      totalExecutions: 0,
      todayExecutions: 0,
      currentMonthName,
      fullTodayDate,
      recentDays,
    };
  }

  const uniqueDaySet = new Set<string>(sortedDays);
  const yesterdayStr = format(subDays(referenceDate, 1), 'yyyy-MM-dd');

  const hasExecutedToday = uniqueDaySet.has(todayStr);
  const hasExecutedYesterday = uniqueDaySet.has(yesterdayStr);

  // Compute current streak
  let currentStreak = 0;
  if (hasExecutedToday) {
    currentStreak = 1;
    let checkDate = subDays(referenceDate, 1);
    while (uniqueDaySet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  } else if (hasExecutedYesterday) {
    currentStreak = 1;
    let checkDate = subDays(referenceDate, 2);
    while (uniqueDaySet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Compute longest streak across all history
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dayStr of sortedDays) {
    const [year, month, day] = dayStr.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);

    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffTime = startOfDay(currentDate).getTime() - startOfDay(prevDate).getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currentDate;
  }

  let status: StreakStatus = 'INACTIVE';
  if (hasExecutedToday) {
    status = 'ACTIVE_TODAY';
  } else if (hasExecutedYesterday) {
    status = 'AT_RISK';
  }

  return {
    currentStreak,
    longestStreak,
    hasExecutedToday,
    status,
    lastExecutedDate: sortedDays[sortedDays.length - 1],
    totalExecutions: dates.length,
    todayExecutions,
    currentMonthName,
    fullTodayDate,
    recentDays,
  };
}

/**
 * Fetch execution events and calculate the user's distribution streak.
 * Counts actual user distribution activities: content imports, plan creation, and asset generation.
 */
export async function calculateExecutionStreak(userId: string): Promise<ExecutionStreak> {
  // Query active distribution milestones
  const [sources, plans, assets] = await Promise.all([
    db.query.contentSources.findMany({
      where: eq(contentSources.userId, userId),
      columns: {
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.query.distributionPlans.findMany({
      where: eq(distributionPlans.userId, userId),
      columns: {
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.query.distributionAssets.findMany({
      where: eq(distributionAssets.userId, userId),
      columns: {
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const activityDates: Date[] = [
    ...sources.map((s) => new Date(s.createdAt)),
    ...plans.map((p) => new Date(p.createdAt)),
    ...assets.map((a) => new Date(a.updatedAt || a.createdAt)),
  ];

  return computeStreakMetrics(activityDates);
}
