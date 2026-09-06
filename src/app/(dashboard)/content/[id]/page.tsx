import { db } from "@/lib/db";
import { contentSources, distributionPlans } from "@/lib/db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { AnalyzeButton } from "@/features/content-intelligence/components/AnalyzeButton";
import { PlanGeneratorButton } from "@/features/distribution/components/PlanGeneratorButton";
import { notFound } from "next/navigation";

export default async function ContentAnalysisPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return notFound();

  const source = await db.query.contentSources.findFirst({
    where: and(eq(contentSources.id, params.id), eq(contentSources.userId, session.user.id)),
    with: {
      intelligence: {
        with: {
          ideas: true,
        },
      },
    },
  });

  if (!source) return notFound();

  // Check if plan exists
  const existingPlan = await db.query.distributionPlans.findFirst({
    where: and(eq(distributionPlans.contentSourceId, source.id), eq(distributionPlans.userId, session.user.id))
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/content" className="hover:text-foreground hover:underline">Content</Link>
            <span>/</span>
            <span>Analysis</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{source.title}</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(source.createdAt).toLocaleDateString()} &middot; {source.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {existingPlan && (
            <Link 
              href={`/content/${source.id}/distribution`} 
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
            >
              View Distribution Plan
            </Link>
          )}
          <AnalyzeButton sourceId={source.id} hasIntelligence={!!source.intelligence} />
        </div>
      </div>

      <Card className="flex flex-col">
        <CardContent className="pt-6 flex-grow space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Raw Content</h3>
            <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md whitespace-pre-wrap max-h-96 overflow-y-auto">
              {source.rawContent}
            </p>
          </div>

          {source.intelligence ? (
            <div className="space-y-6 border-t pt-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Summary</h3>
                <p className="text-sm">{source.intelligence.summary}</p>
              </div>

              {source.intelligence.coreThesis && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Core Thesis</h3>
                  <p className="text-sm italic border-l-2 pl-3 py-1">{source.intelligence.coreThesis}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {source.intelligence.topics.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-1">
                      {source.intelligence.topics.map(t => (
                        <span key={t} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {source.intelligence.technicalConcepts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Technical Concepts</h3>
                    <div className="flex flex-wrap gap-1">
                      {source.intelligence.technicalConcepts.map(t => (
                        <span key={t} className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold text-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {source.intelligence.opinions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Opinions</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {source.intelligence.opinions.map(o => <li key={o}>{o}</li>)}
                    </ul>
                  </div>
                )}

                {source.intelligence.lessons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Lessons</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {source.intelligence.lessons.map(l => <li key={l}>{l}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Content Ideas Section */}
              {source.intelligence.ideas && source.intelligence.ideas.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4 tracking-tight">CONTENT IDEAS</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {source.intelligence.ideas.map((idea, idx) => (
                      <div key={idea.id} className="border rounded-md p-4 bg-muted/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] px-2 py-1 font-bold rounded-bl-md">
                          ANGLE: {idea.angle.toUpperCase()}
                        </div>
                        <h4 className="font-semibold mb-2 pr-20">{idx + 1}. {idea.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{idea.summary}</p>
                        <div className="text-xs bg-muted p-2 rounded-sm border-l-2 border-primary/40">
                          <strong>Source Context:</strong> {idea.sourceContext}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-4 border-t flex justify-end">
                {!existingPlan && <PlanGeneratorButton sourceId={source.id} />}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20 mt-6">
              <p className="text-muted-foreground mb-4">This content has not been analyzed yet.</p>
              <AnalyzeButton sourceId={source.id} hasIntelligence={false} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
