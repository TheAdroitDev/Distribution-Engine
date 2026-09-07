import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/validation/env";
import type { AiAssetResponse } from "../schemas/asset-schema";

export type AssetGenerationContext = {
  sourceTitle: string;
  sourceType: string;
  sourceRawContent: string;
  intelligenceSummary: string;
  intelligenceTopics: string[];
  intelligenceConcepts: string[];
  ideaTitle: string;
  ideaSummary: string;
  ideaAngle: string;
  profileExpertise: string[];
  profileVoice: Record<string, unknown>; // { tone, verbosity, technicality, formality }
  profileContentPrefs: string[];
  audienceName: string;
  audienceContext: string | null;
  strategyPlatform: string;
  strategyFormat: string;
  strategyAction: string;
  strategyAngle: string;
  strategyRationale: string;
  platformConstraints: Record<string, unknown>;
  platformStrategyRules: Record<string, unknown>;
  previousDraft?: string;
  forceVariation?: boolean;
};

function buildOutputInstructions(context: AssetGenerationContext): string {
  const supportsThreads = !!(context.platformConstraints as Record<string, boolean>).supportsThreads;
  
  if (supportsThreads && (context.strategyFormat === "thread" || context.strategyFormat === "create_thread")) {
    return `
Return a JSON object with this schema:
{
  "title": "A short descriptive title for the thread, or null.",
  "body": "The opening/main post of the thread. This MUST contain substantive content. Never leave body empty.",
  "metadata": {
    "items": ["Each additional post in the thread as a separate string in this array."]
  }
}

CRITICAL: The "body" field MUST contain the main/opening content. It must NEVER be empty.
The "metadata.items" array contains follow-up posts only.`;
  }

  return `
Return a JSON object with this schema:
{
  "title": "A descriptive title for this content piece. Use null only for very short social posts that naturally have no title.",
  "body": "The COMPLETE content of the asset. This MUST contain ALL the generated content. Never leave body empty. Do NOT split content into metadata.items."
}

CRITICAL: Put ALL generated content in the "body" field. The "body" field MUST contain substantive content and must NEVER be empty.
Do NOT use metadata.items. This platform/format does not use thread-style multi-part content.`;
}

export async function generatePlatformNativeAsset(context: AssetGenerationContext): Promise<AiAssetResponse> {
  const outputInstructions = buildOutputInstructions(context);

  let xRules = "";
  if (context.strategyPlatform === 'X' || context.strategyPlatform === 'x' || context.strategyPlatform.toLowerCase() === 'x') {
    if (context.strategyFormat === 'technical_opinion') {
      xRules = `
CRITICAL X TECHNICAL_OPINION RULES:
1. MUST be a single, standalone post. NOT a thread. No numbering (e.g., no "1/").
2. MUST NOT use any emojis.
3. MUST NOT use the em dash character ("—").
4. MUST be concise, human-sounding, and direct developer language.
5. MUST NOT use corporate marketing language, exaggerated claims, or generic motivational writing.
6. MUST be <= 280 characters in length total.
`;
    }
  }

  let regenerationRules = "";
  if (context.previousDraft) {
    regenerationRules = `
---
REGENERATION CONTEXT
---
You are regenerating an existing draft. The user requested a new version.
Previous Draft Body:
"${context.previousDraft}"

CRITICAL REGENERATION INSTRUCTION:
Create a materially different version of the content.
Do NOT reuse the same opening, sentence structure, or exact wording as the previous draft.
${context.forceVariation ? "The previous regeneration attempt was too similar. You MUST completely re-write the phrasing, emphasize a different aspect of the angle, or use a completely different hook." : ""}
The distribution strategy (Platform, Format, Angle, Factual Constraints) REMAINS AUTHORITATIVE. Do not change the strategy, just write it differently.
`;
  }

  const prompt = `
You are the asset generator for an expert creator.
Your job is to generate a platform-native content asset based on an explicitly approved distribution strategy.

CRITICAL CONTENT FIDELITY RULE:
You MUST rely solely on the supplied source material as the factual source.
DO NOT invent facts, claims, metrics, experiences, quotes, or project details not supported by the supplied content.
If the source material lacks details, speak generally or frame it conceptually, but DO NOT hallucinate specifics.

---
SOURCE MATERIAL
---
Source Title: ${context.sourceTitle}
Source Type: ${context.sourceType}
Source Intelligence Summary: ${context.intelligenceSummary}
Source Topics: ${context.intelligenceTopics.join(", ")}
Source Technical Concepts: ${context.intelligenceConcepts.join(", ")}

Original Raw Content:
${context.sourceRawContent}

---
DISTRIBUTION STRATEGY
---
Platform: ${context.strategyPlatform}
Format: ${context.strategyFormat}
Action: ${context.strategyAction}
Audience: ${context.audienceName} (${context.audienceContext || "No description provided"})
Content Idea: ${context.ideaTitle} - ${context.ideaSummary}
Strategy Angle: ${context.strategyAngle}
Strategy Rationale: ${context.strategyRationale}

---
PLATFORM CONSTRAINTS & RULES
---
Platform Constraints: ${JSON.stringify(context.platformConstraints, null, 2)}
Platform Strategy Rules: ${JSON.stringify(context.platformStrategyRules, null, 2)}

---
USER VOICE
---
Voice Preferences: ${JSON.stringify(context.profileVoice, null, 2)}
Content Preferences: ${context.profileContentPrefs.join(", ")}
Expertise: ${context.profileExpertise.join(", ")}
${xRules}
${regenerationRules}
---
INSTRUCTIONS
---
Generate the asset explicitly matching the strategy platform (${context.strategyPlatform}) and format (${context.strategyFormat}).
Write the content natively for this platform, respecting its strategy rules and constraints.
Do NOT output generic AI filler. Use the user's explicit voice preferences.

${outputInstructions}
`;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          title: { type: "string", nullable: true },
          body: { type: "string" },
          metadata: {
            type: "object",
            properties: {
              items: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["body"]
      }
    }
  });

  if (!response.text) {
    throw new Error("AI returned empty response");
  }

  const parsed = JSON.parse(response.text);
  
  return {
    title: parsed.title || null,
    body: parsed.body,
    metadata: parsed.metadata?.items?.length ? { items: parsed.metadata.items } : undefined
  };
}
