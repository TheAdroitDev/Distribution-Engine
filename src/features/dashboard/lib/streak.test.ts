import { describe, it, expect } from "vitest";
import { computeStreakMetrics } from "./streak";

describe("Execution Streak Computation", () => {
  const refToday = new Date("2026-09-07T12:00:00Z");

  it("returns 0 streak for empty activity", () => {
    const res = computeStreakMetrics([], refToday);
    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(0);
    expect(res.hasExecutedToday).toBe(false);
    expect(res.status).toBe("INACTIVE");
  });

  it("identifies streak extended today", () => {
    const dates = [
      new Date("2026-09-07T08:00:00Z"),
      new Date("2026-09-06T10:00:00Z"),
      new Date("2026-09-05T14:00:00Z"),
    ];

    const res = computeStreakMetrics(dates, refToday);
    expect(res.currentStreak).toBe(3);
    expect(res.longestStreak).toBe(3);
    expect(res.hasExecutedToday).toBe(true);
    expect(res.status).toBe("ACTIVE_TODAY");
  });

  it("identifies streak at risk when executed yesterday but not today", () => {
    const dates = [
      new Date("2026-09-06T10:00:00Z"),
      new Date("2026-09-05T14:00:00Z"),
    ];

    const res = computeStreakMetrics(dates, refToday);
    expect(res.currentStreak).toBe(2);
    expect(res.longestStreak).toBe(2);
    expect(res.hasExecutedToday).toBe(false);
    expect(res.status).toBe("AT_RISK");
  });

  it("resets current streak to 0 when last execution was 2 days ago", () => {
    const dates = [
      new Date("2026-09-04T10:00:00Z"),
      new Date("2026-09-03T14:00:00Z"),
    ];

    const res = computeStreakMetrics(dates, refToday);
    expect(res.currentStreak).toBe(0);
    expect(res.longestStreak).toBe(2);
    expect(res.hasExecutedToday).toBe(false);
    expect(res.status).toBe("INACTIVE");
  });

  it("accurately computes historical longest streak with intermittent gaps", () => {
    const dates = [
      // 4-day block
      "2026-08-01",
      "2026-08-02",
      "2026-08-03",
      "2026-08-04",
      // gap
      // 2-day block today
      "2026-09-06",
      "2026-09-07",
    ];

    const res = computeStreakMetrics(dates, refToday);
    expect(res.currentStreak).toBe(2);
    expect(res.longestStreak).toBe(4);
    expect(res.hasExecutedToday).toBe(true);
    expect(res.status).toBe("ACTIVE_TODAY");
  });

  it("handles duplicate executions on the same day", () => {
    const dates = [
      new Date("2026-09-07T08:00:00Z"),
      new Date("2026-09-07T12:00:00Z"),
      new Date("2026-09-07T18:00:00Z"),
    ];

    const res = computeStreakMetrics(dates, refToday);
    expect(res.currentStreak).toBe(1);
    expect(res.longestStreak).toBe(1);
    expect(res.hasExecutedToday).toBe(true);
    expect(res.totalExecutions).toBe(3);
    expect(res.todayExecutions).toBe(3);
  });

  it("builds calendar recentDays grid for the full current month with date labels", () => {
    const dates = [
      new Date("2026-09-07T08:00:00Z"),
      new Date("2026-09-06T10:00:00Z"),
    ];

    const res = computeStreakMetrics(dates, refToday);
    // September has 30 days
    expect(res.recentDays).toHaveLength(30);
    expect(res.currentMonthName).toBe("September 2026");
    expect(res.fullTodayDate).toBe("Monday, September 7, 2026");

    const sep7 = res.recentDays.find((d) => d.dayNumber === 7);
    expect(sep7?.isToday).toBe(true);
    expect(sep7?.hasExecuted).toBe(true);
    expect(sep7?.count).toBe(1);
    expect(sep7?.fullDateLabel).toBe("Monday, September 7, 2026");

    const sep6 = res.recentDays.find((d) => d.dayNumber === 6);
    expect(sep6?.isToday).toBe(false);
    expect(sep6?.hasExecuted).toBe(true);
    expect(sep6?.count).toBe(1);

    const sep8 = res.recentDays.find((d) => d.dayNumber === 8);
    expect(sep8?.isFuture).toBe(true);
    expect(sep8?.hasExecuted).toBe(false);
  });
});
