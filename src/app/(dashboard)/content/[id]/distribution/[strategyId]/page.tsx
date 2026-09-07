import { db } from "@/lib/db";
import { distributionStrategies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCachedSession } from "@/lib/auth/session";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetEditor } from "@/features/assets/components/AssetEditor";
import { PLATFORMS } from "@/features/platforms/definitions";
import type { DistributionAsset } from "@/features/assets/schemas/asset-schema";

export default async function DistributionAssetPage({ params }: { params: Promise<{ id: string; strategyId: string }> }) {
  const resolvedParams = await params;
  const session = await getCachedSession();
  if (!session?.user?.id) return null;

  // Query strategy directly by ID with relational plan verification and active assets in 1 query
  const strategy = await db.query.distributionStrategies.findFirst({
    where: eq(distributionStrategies.id, resolvedParams.strategyId),
    with: {
      plan: true,
      idea: true,
      audience: true,
      assets: {
        where: (assets, { eq: eqAsset }) => eqAsset(assets.userId, session.user.id),
        orderBy: (assets, { desc: descAsset }) => [descAsset(assets.createdAt)],
      },
    },
  });

  // Verify ownership and ensure this strategy belongs to the requested content source
  if (
    !strategy ||
    strategy.plan.userId !== session.user.id ||
    strategy.plan.contentSourceId !== resolvedParams.id
  ) {
    return notFound();
  }

  // Find active asset (READY or DRAFT), excluding archived
  const activeAssets = strategy.assets || [];
  const assetRecord = activeAssets.find(a => a.status !== 'ARCHIVED') || undefined;

  const platform = PLATFORMS[strategy.platformId as keyof typeof PLATFORMS];

  // Cast DB record to our schema type
  const asset: DistributionAsset | undefined = assetRecord ? {
      ...assetRecord,
      metadata: assetRecord.metadata as { items?: string[] } | undefined
  } as DistributionAsset : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/content/${resolvedParams.id}/distribution`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          &larr; Back to Strategies
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
