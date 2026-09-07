import { db } from "@/lib/db";
import { contentSources, distributionPlans } from "@/lib/db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getCachedSession } from "@/lib/auth/session";
import { eq, and } from "drizzle-orm";
import { AnalyzeButton } from "@/features/content-intelligence/components/AnalyzeButton";
import { PlanGeneratorButton } from "@/features/distribution/components/PlanGeneratorButton";
import { NextActionBanner } from "@/features/content/components/NextActionBanner";
import { deriveContentMetrics, deriveNextAction } from "@/features/content/lib/content-state";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowRight, FileText, BrainCircuit, Share2, Layers, CheckCircle2 } from "lucide-react";
import { ExpandableContent } from "@/features/content/components/ExpandableContent";
import { DeleteContentButton } from "@/features/content/components/DeleteContentButton";

export default async function ContentAnalysisPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getCachedSession();

  if (!session?.user?.id) return notFound();
  const userId = session.user.id;

  const source = await db.query.contentSources.findFirst({
    where: and(eq(contentSources.id, params.id), eq(contentSources.userId, userId)),
    with: {
      intelligence: {
        with: {
          ideas: true,
        },
      },
      plans: {
        where: eq(distributionPlans.userId, userId),
        with: {
          strategies: {
            with: {
              assets: true,
            },
          },
        },
      },
    },
  });

  if (!source) return notFound();

  const metrics = deriveContentMetrics(source);
  const nextAction = deriveNextAction(source);
  const createdDateStr = format(new Date(source.createdAt), "PPP");
  const hasValidPlan = metrics.hasPlan && metrics.strategyCount > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-morph-in">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
            <Link href="/content" className="hover:text-foreground hover:underline">
              Content Workspace
            </Link>
            <span>/</span>
            <span className="text-foreground">Detail</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{source.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Created on {createdDateStr} &middot; <span className="uppercase font-mono text-xs">{source.type}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <AnalyzeButton sourceId={source.id} hasIntelligence={metrics.isAnalyzed} />
          {hasValidPlan ? (
            <Link
              href={`/content/${source.id}/distribution`}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
            >
              <span>View Strategies</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : metrics.isAnalyzed ? (
            <PlanGeneratorButton sourceId={source.id} />
          ) : null}
          <DeleteContentButton
            contentId={source.id}
            contentTitle={source.title}
            variant="outline"
            size="sm"
            showText
            redirectTo="/content"
            className="h-9 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          />
        </div>
      </div>

      {/* Target 3: Context-aware Next Action */}
      <NextActionBanner
        sourceId={source.id}
        hasIntelligence={metrics.isAnalyzed}
        nextAction={nextAction}
      />

      {/* Target 2: Three Structured Workspaces (SOURCE, INTELLIGENCE, DISTRIBUTION) */}
      <div className="grid gap-6">
        {/* 1. SOURCE SECTION */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold tracking-tight uppercase">Source</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {source.rawContent.length} characters
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border bg-muted/20 p-2.5">
                <span className="text-muted-foreground block mb-0.5">Title</span>
                <span className="font-medium text-foreground truncate block">{source.title}</span>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5">
                <span className="text-muted-foreground block mb-0.5">Format</span>
                <span className="font-medium text-foreground uppercase block">{source.type}</span>
              </div>
              <div className="rounded-lg border bg-muted/20 p-2.5">
                <span className="text-muted-foreground block mb-0.5">Added Date</span>
                <span className="font-medium text-foreground block">{createdDateStr}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                Original Content
              </label>
              <ExpandableContent content={source.rawContent} />
            </div>
          </CardContent>
        </Card>

        {/* 2. DISCOVER & INSIGHTS SECTION */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold tracking-tight uppercase">Discover & Insights</CardTitle>
              </div>
              {metrics.isAnalyzed && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  Discovered
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {source.intelligence ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-lg border border-border/40">
                    {source.intelligence.summary}
                  </p>
                </div>

                {source.intelligence.coreThesis && (
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Core Thesis
                    </h3>
                    <p className="text-sm italic border-l-2 border-primary pl-3.5 py-1 text-foreground">
                      &ldquo;{source.intelligence.coreThesis}&rdquo;
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {source.intelligence.topics.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Topics
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {source.intelligence.topics.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {source.intelligence.technicalConcepts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Technical Concepts
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {source.intelligence.technicalConcepts.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {source.intelligence.ideas && source.intelligence.ideas.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Discovered Angles & Ideas ({source.intelligence.ideas.length})
                      </h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {source.intelligence.ideas.map((idea, idx) => (
                        <div
                          key={idea.id}
                          className="rounded-lg border border-border/70 bg-card p-3.5 space-y-2 relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-primary font-mono">
                              #{idx + 1}
                            </span>
                            <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-tight">
                              {idea.angle}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm leading-snug">{idea.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {idea.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg bg-muted/10 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Content has not been analyzed yet. Discover insights to extract structure and angles.
                </p>
                <AnalyzeButton sourceId={source.id} hasIntelligence={false} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. DISTRIBUTION SECTION */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-primary" />
                <CardTitle className="text-base font-semibold tracking-tight uppercase">Distribution & Strategies</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {metrics.hasPlan ? `Status: ${metrics.planStatus || 'ACTIVE'}` : 'No Plan'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Distribution metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-xl border bg-card p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Plan Status</span>
                <span className="text-sm font-semibold block text-foreground truncate">
                  {metrics.hasPlan && metrics.strategyCount > 0 ? metrics.planStatus || "ACTIVE" : "Not Created"}
                </span>
              </div>
              <div className="rounded-xl border bg-card p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Strategies</span>
                <span className="text-lg font-bold block text-foreground">{metrics.strategyCount}</span>
              </div>
              <div className="rounded-xl border bg-card p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Accepted</span>
                <span className="text-lg font-bold block text-emerald-600 dark:text-emerald-400">
                  {metrics.acceptedStrategiesCount}
                </span>
              </div>
              <div className="rounded-xl border bg-card p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Ready Assets</span>
                <span className="text-lg font-bold block text-foreground">{metrics.readyAssetsCount}</span>
              </div>
              <div className="rounded-xl border bg-card p-3 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block">Queued</span>
                <span className="text-lg font-bold block text-primary">{metrics.queuedCount}</span>
              </div>
            </div>

            {/* Distribution Action CTAs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                {hasValidPlan
                  ? "A distribution strategy roadmap has been generated for this content."
                  : metrics.isAnalyzed
                  ? "Generate tailored multi-platform strategies from your discovered insights."
                  : "Discover insights first before creating distribution strategies."}
              </p>

              <div className="flex items-center gap-2">
                {hasValidPlan ? (
                  <Link
                    href={`/content/${source.id}/distribution`}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-all"
                  >
                    <Layers className="size-4" />
                    <span>View Strategies</span>
                  </Link>
                ) : metrics.isAnalyzed ? (
                  <PlanGeneratorButton sourceId={source.id} />
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

