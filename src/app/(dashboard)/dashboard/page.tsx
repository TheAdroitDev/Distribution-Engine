import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getCachedSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { contentSources, distributionProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DuoIcon } from "@/components/ui/duo-icon";
import { NewDistributionButton } from "@/components/common/NewDistributionButton";
import { calculateExecutionStreak } from "@/features/dashboard/lib/streak";
import { getDashboardActionData } from "@/features/dashboard/lib/next-action";
import { NextActionCard } from "@/features/dashboard/components/NextActionCard";
import { ExecutionStreakCard } from "@/features/dashboard/components/ExecutionStreakCard";
import { OnboardingQuestionnaireDialog } from "@/features/onboarding/components/OnboardingQuestionnaireDialog";

export default async function DashboardOverview() {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  // Fetch streak, action data, recent content, and user profile concurrently
  const [streak, actionData, recentContent, profile] = await Promise.all([
    calculateExecutionStreak(userId),
    getDashboardActionData(userId),
    db.query.contentSources.findMany({
      where: eq(contentSources.userId, userId),
      columns: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
      },
      orderBy: [desc(contentSources.createdAt)],
      limit: 5,
    }),
    db.query.distributionProfiles.findFirst({
      where: eq(distributionProfiles.userId, userId),
      columns: {
        contentPreferences: true,
      },
    }),
  ]);

  const { pipeline, nextAction } = actionData;
  const hasCompletedOnboarding =
    Array.isArray(profile?.contentPreferences) &&
    profile.contentPreferences.includes("onboarding_completed");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* Post-login Onboarding Questionnaire */}
      {!hasCompletedOnboarding && (
        <OnboardingQuestionnaireDialog defaultOpen={true} />
      )}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Your end-to-end distribution journey: from raw content to scheduled campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewDistributionButton />
        </div>
      </div>

      {/* Hero Section: Next Action Hub & Execution Streak */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2">
          <NextActionCard action={nextAction} pipeline={pipeline} className="h-full" />
        </div>
        <div className="lg:col-span-1">
          <ExecutionStreakCard streak={streak} className="h-full" />
        </div>
      </div>

      {/* Metrics Section: Completely Redesigned Executive Themes */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Content Sources Card */}
        <Link
          href="/content"
          className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/80 via-emerald-400 to-teal-400" />
          <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Content Sources
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-transform group-hover:scale-105">
                <DuoIcon name="file" className="size-4.5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground/40 transition-transform group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {pipeline.totalSources}
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <span>{pipeline.analyzedSources} with discovered insights</span>
            </div>
          </div>
        </Link>

        {/* Distribution Plans Card */}
        <Link
          href="/plans"
          className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500/80 via-indigo-400 to-cyan-400" />
          <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-colors" />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Distribution Plans
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-transform group-hover:scale-105">
                <DuoIcon name="layers" className="size-4.5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground/40 transition-transform group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {pipeline.totalPlans}
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{pipeline.acceptedStrategies} accepted strategies</span>
            </div>
          </div>
        </Link>

        {/* Distribution Assets Card */}
        <Link
          href="/plans"
          className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500/80 via-purple-400 to-pink-400" />
          <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-colors" />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Distribution Assets
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-transform group-hover:scale-105">
                <DuoIcon name="clipboard" className="size-4.5" />
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground/40 transition-transform group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {pipeline.readyAssets}
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-500/20">
              <span className="size-1.5 rounded-full bg-violet-500 shrink-0" />
              <span>{pipeline.readyAssets} generated & ready</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Content Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-end justify-between px-1">
          <h2 className="text-lg font-semibold tracking-tight">Recent Content</h2>
          <Link 
            href="/content" 
            className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        
        {recentContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/60 bg-muted/30">
            <div className="p-4 bg-muted rounded-full mb-4">
              <DuoIcon name="file" className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No content sources yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
              Begin your distribution journey by importing an article, newsletter, or text note.
            </p>
            <Link 
              href="/content/new" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Add Content
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {recentContent.map((source, i) => (
              <Link 
                key={source.id} 
                href={`/content/${source.id}`}
                className="group block"
              >
                <Card 
                  className="bg-card transition-all duration-300 hover:shadow-md hover:border-primary/30 active:scale-[0.99]"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {source.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-muted border border-border/50 text-xs font-medium">
                          {source.type}
                        </span>
                        <span>&middot;</span>
                        <span>{formatDistanceToNow(source.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted opacity-0 group-hover:opacity-100 group-hover:bg-primary/10 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 shrink-0">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
