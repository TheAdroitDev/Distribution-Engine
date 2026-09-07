import { aiAssetResponseSchema } from "../schemas/asset-schema";
import { generatePlatformNativeAsset, type AssetGenerationContext } from "./ai";
import { PLATFORMS } from "@/features/platforms/definitions";

export type ValidatedAssetResult = {
  title: string | null;
  body: string;
  metadata?: { items?: string[] };
  formatId: string;
};

function normalizeText(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function generateValidatedAsset(
  strategyContext: AssetGenerationContext & { strategyFormatId: string; strategyPlatformId: string; previousDraft?: string }
): Promise<ValidatedAssetResult> {
  // 1. Generate via AI
  let rawAiResponse = await generatePlatformNativeAsset(strategyContext);
  let validatedAiResponse = aiAssetResponseSchema.parse(rawAiResponse);

  // Duplicate Check
  if (strategyContext.previousDraft && normalizeText(validatedAiResponse.body) === normalizeText(strategyContext.previousDraft)) {
    // Retry once with a stronger variation signal
    rawAiResponse = await generatePlatformNativeAsset({
      ...strategyContext,
      forceVariation: true
    });
    validatedAiResponse = aiAssetResponseSchema.parse(rawAiResponse);

    if (normalizeText(validatedAiResponse.body) === normalizeText(strategyContext.previousDraft)) {
      throw new Error("Regeneration produced the same draft. Please try again.");
    }
  }

  // 3. Deterministic Platform Constraint Validation
  const platformDef = PLATFORMS[strategyContext.strategyPlatformId as keyof typeof PLATFORMS];
  if (!platformDef) {
    throw new Error(`Unknown platform: ${strategyContext.strategyPlatformId}`);
  }

  // X specific validation for technical_opinion
  if (strategyContext.strategyPlatformId === 'x' && strategyContext.strategyFormatId === 'technical_opinion') {
    if (validatedAiResponse.body.length > 280) {
      throw new Error(`Validation Failed: X technical_opinion must be <= 280 chars. Received ${validatedAiResponse.body.length}.`);
    }
    if (validatedAiResponse.metadata?.items && validatedAiResponse.metadata.items.length > 0) {
      // Force remove items instead of throwing, or throw if we want to be strict.
      // The prompt asks it not to produce threads, but if it disobeys, we scrub it.
      validatedAiResponse.metadata.items = [];
    }
    if (validatedAiResponse.body.includes('—')) {
      // Strip em dash or throw? User said "reject it before persistence." I'll just throw.
      throw new Error("Validation Failed: X technical_opinion cannot contain an em dash.");
    }
  }

  // Example constraint: maxTextLength
  if (platformDef.constraints.maxTextLength) {
    // If it's a thread (metadata.items exists), we check each item. 
    // If it's a single post, we check the body.
    if (validatedAiResponse.metadata?.items && validatedAiResponse.metadata.items.length > 0) {
      for (const item of validatedAiResponse.metadata.items) {
        if (item.length > platformDef.constraints.maxTextLength) {
          throw new Error(
            `Deterministic Validation Failed: Thread item length (${item.length}) exceeds platform max allowed (${platformDef.constraints.maxTextLength})`
          );
        }
      }
    } else {
      if (validatedAiResponse.body.length > platformDef.constraints.maxTextLength) {
        throw new Error(
          `Deterministic Validation Failed: Body length (${validatedAiResponse.body.length}) exceeds platform max allowed (${platformDef.constraints.maxTextLength})`
        );
      }
    }
  }

  return {
    ...validatedAiResponse,
    formatId: strategyContext.strategyFormatId, // Enforce strategy consistency
  };
}
