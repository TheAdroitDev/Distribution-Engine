import { z } from "zod";

export const aiAssetMetadataSchema = z.object({
  items: z.array(z.string()).optional()
});

export const aiAssetResponseSchema = z.object({
  title: z.string().nullable(),
  body: z.string().min(1, "Asset body must not be empty"),
  metadata: aiAssetMetadataSchema.optional()
});

export type AiAssetResponse = z.infer<typeof aiAssetResponseSchema>;

export const distributionAssetSchema = z.object({
  id: z.string().uuid(),
  strategyId: z.string().uuid(),
  userId: z.string().uuid(),
  formatId: z.string(),
  title: z.string().nullable(),
  body: z.string(),
  metadata: aiAssetMetadataSchema.optional(),
  status: z.enum(["DRAFT", "READY", "ARCHIVED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DistributionAsset = z.infer<typeof distributionAssetSchema>;
