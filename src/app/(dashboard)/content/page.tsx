import { db } from "@/lib/db";
import { contentSources, distributionPlans } from "@/lib/db/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getCachedSession } from "@/lib/auth/session";
import { eq, desc } from "drizzle-orm";
import { AnalyzeButton } from "@/features/content-intelligence/components/AnalyzeButton";
import { deriveContentMetrics } from "@/features/content/lib/content-state";
import { Plus, ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "cn";
import { ExpandableContent } from "@/features/content/components/ExpandableContent";
import { DeleteContentButton } from "@/features/content/components/DeleteContentButton";
import { NewDistributionButton } from "@/components/common/NewDistributionButton";
import { MorphingContentCard } from "@/features/content/components/MorphingContentCard";

function getContentTypeConfig(type: string) {
  const normalized = (type || "").toUpperCase();
  if (normalized.includes("MD") || normalized.includes("MARKDOWN")) {
    return {
      label: "Markdown",
      badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    };
  }
  if (normalized.includes("URL") || normalized.includes("LINK") || normalized.includes("WEB") || normalized.includes("HTTP")) {
    return {
      label: "Web Link",
      badgeClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
    };
  }
  return {
    label: type || "Raw Text",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  };
}

export default async function ContentPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await getCachedSession();

  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const sources = await db.query.contentSources.findMany({
    where: eq(contentSources.userId, userId),
    with: {
      intelligence: {
        columns: {
          id: true,
        },
      },
      plans: {
        where: eq(distributionPlans.userId, userId),
        with: {
          strategies: {
            columns: {
              id: true,
              status: true,
            },
            with: {
              assets: {
                columns: {
                  id: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [desc(contentSources.createdAt)],
    limit: pageSize + 1, // Fetch one extra to determine if there is a next page
    offset,
  });

  const hasNextPage = sources.length > pageSize;
  const displaySources = sources.slice(0, pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Manage your input content, extracted intelligence, and distribution pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewDistributionButton label="Add Content" />
        </div>
      </div>

      {displaySources.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20 space-y-3">
          <p className="text-muted-foreground">No content sources found. Create your first piece to start.</p>
          <NewDistributionButton label="Add Content" />
        </div>
      ) : (
        <div className="space-y-4">
          {displaySources.map((source, index) => {
            const metrics = deriveContentMetrics(source);
            const createdDateStr = format(new Date(source.createdAt), "MMM d, yyyy");
            const typeConfig = getContentTypeConfig(source.type);

            return (
              <MorphingContentCard key={source.id} index={index}>
                <Card className="border-0 ring-0 bg-card hover:shadow-xs transition-all duration-200 rounded-xl overflow-hidden">
                  <CardHeader className="p-5 pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Title + Pipeline Badges */}
                      <div className="space-y-2 min-w-0 flex-1">
                        {/* Title + Format Pill + Date */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/content/${source.id}`}
                            className="text-base sm:text-lg font-semibold tracking-tight hover:underline text-foreground truncate"
                          >
                            {source.title}
                          </Link>
                          <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", typeConfig.badgeClass)}>
                            {typeConfig.label}
                          </span>
                          <span className="text-xs text-muted-foreground sm:ml-auto">
                            {createdDateStr}
                          </span>
                        </div>

                        {/* Distinct Pipeline State Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {metrics.isAnalyzed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                              Analyzed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                              <Clock className="size-3.5" />
                              Not Analyzed
                            </span>
                          )}

                          {metrics.hasPlan && metrics.strategyCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                              <Sparkles className="size-3.5 text-purple-600 dark:text-purple-400" />
                              Plan Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/60">
                              No Plan
                            </span>
                          )}

                          {metrics.hasPlan && metrics.strategyCount > 0 && (
                            <div className="inline-flex items-center divide-x divide-border/60 rounded-md border border-border/60 bg-muted/30 text-xs px-2.5 py-0.5 gap-2 text-muted-foreground">
                              <span><strong className="text-foreground">{metrics.acceptedStrategiesCount}</strong> accepted</span>
                              <span className="pl-2"><strong className="text-foreground">{metrics.readyAssetsCount}</strong> ready</span>
                              <span className="pl-2"><strong className="text-foreground">{metrics.queuedCount}</strong> queued</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: State-aware Actions */}
                      <div className="flex items-center gap-2 shrink-0 sm:self-start pt-1 sm:pt-0">
                        {!metrics.isAnalyzed ? (
                          <AnalyzeButton sourceId={source.id} hasIntelligence={false} />
                        ) : !metrics.hasPlan || metrics.strategyCount === 0 ? (
                          <Link
                            href={`/content/${source.id}`}
                            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                          >
                            <span>View Analysis</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/content/${source.id}`}
                              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              Workspace
                            </Link>
                            <Link
                              href={`/content/${source.id}/distribution`}
                              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                            >
                              <span>View Plan</span>
                              <ArrowRight className="size-3.5" />
                            </Link>
                          </div>
                        )}
                        <DeleteContentButton
                          contentId={source.id}
                          contentTitle={source.title}
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 px-5 pb-5">
                    <div className="rounded-lg border-0 bg-muted/20 p-3.5 text-xs text-muted-foreground transition-colors hover:bg-muted/30">
                      <ExpandableContent
                        content={source.rawContent}
                        maxCollapsedHeight="max-h-16"
                        charThreshold={120}
                      />
                    </div>
                  </CardContent>
                </Card>
              </MorphingContentCard>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {(page > 1 || hasNextPage) && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t">
          {page > 1 ? (
            <Link 
              href={`/content?page=${page - 1}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              &larr; Previous
            </Link>
          ) : (
            <div className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted/50 px-4 text-sm font-medium text-muted-foreground cursor-not-allowed">
              &larr; Previous
            </div>
          )}
          
          <span className="text-sm text-muted-foreground">Page {page}</span>
          
          {hasNextPage ? (
            <Link 
              href={`/content?page=${page + 1}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Next &rarr;
            </Link>
          ) : (
            <div className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-muted/50 px-4 text-sm font-medium text-muted-foreground cursor-not-allowed">
              Next &rarr;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
