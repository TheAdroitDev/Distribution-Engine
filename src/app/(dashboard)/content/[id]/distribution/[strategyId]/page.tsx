import { db } from "@/lib/db";
import { distributionStrategies, distributionAssets, distributionPlans } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetEditor } from "@/features/assets/components/AssetEditor";
import { PLATFORMS } from "@/features/platforms/definitions";
import type { DistributionAsset } from "@/features/assets/schemas/asset-schema";

export default async function DistributionAssetPage({ params }: { params: Promise<{ id: string; strategyId: string }> }) {
  const resolvedParams = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const strategy = await db.query.distributionStrategies.findFirst({
    where: and(
      eq(distributionStrategies.id, resolvedParams.strategyId),
      eq(distributionStrategies.planId, (await db.query.distributionPlans.findFirst({
          where: and(
              eq(distributionPlans.contentSourceId, resolvedParams.id),
              eq(distributionPlans.userId, session.user.id)
          )
      }))?.id || "")
    ),
    with: {
      plan: true,
      idea: true,
      audience: true,
    }
  });

  if (!strategy || strategy.plan.userId !== session.user.id) return notFound();

  // Find the active asset (DRAFT or READY) for this strategy
  const activeAssets = await db.query.distributionAssets.findMany({
    where: and(
      eq(distributionAssets.strategyId, strategy.id),
      eq(distributionAssets.userId, session.user.id)
    ),
    orderBy: [desc(distributionAssets.createdAt)],
  });
  
  // Exclude archived unless it's the only thing there
  const assetRecord = activeAssets.find(a => a.status !== 'ARCHIVED') || undefined;

  const platform = PLATFORMS[strategy.platformId as keyof typeof PLATFORMS];

  // Cast DB record to our schema type
  const asset: DistributionAsset | undefined = assetRecord ? {
      ...assetRecord,
      metadata: assetRecord.metadata as { items?: string[] } | undefined
  } as DistributionAsset : undefined;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/content/${resolvedParams.id}/distribution`} className="text-muted-foreground hover:text-foreground">
          &larr; Back to Distribution Plan
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distribution Asset</h1>
        <p className="text-muted-foreground mt-1">
          Review and generate content for <span className="font-semibold text-foreground">{platform?.name || strategy.platformId}</span>
        </p>
      </div>

      <div className="p-4 bg-muted/20 border rounded-lg space-y-2 text-sm">
        <h3 className="font-semibold text-base mb-3">Strategy Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <span className="text-muted-foreground">Format:</span> <span className="font-medium">{strategy.formatId}</span>
            </div>
            <div>
                <span className="text-muted-foreground">Action:</span> <span className="font-medium">{strategy.actionId}</span>
            </div>
            <div>
                <span className="text-muted-foreground">Audience:</span> <span className="font-medium">{strategy.audience.name}</span>
            </div>
            <div>
                <span className="text-muted-foreground">Idea:</span> <span className="font-medium">{strategy.idea.title}</span>
            </div>
        </div>
        <div className="pt-2">
            <span className="text-muted-foreground">Angle:</span> {strategy.angle}
        </div>
        <div>
            <span className="text-muted-foreground">Rationale:</span> {strategy.rationale}
        </div>
      </div>

      <AssetEditor 
        key={asset?.id ?? "no-asset"}
        asset={asset} 
        strategyId={strategy.id} 
        platformName={platform?.name || strategy.platformId} 
      />
    </div>
  );
}
