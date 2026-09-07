import { GoogleGenAI } from "@google/genai";
import { type AiStrategyRecommendation } from "../schemas/strategy-schema";
import type { ScoredCandidate } from "../schemas/strategy-schema";
import { env } from "@/lib/validation/env";


export type AiEvaluatorInput = {
  candidates: ScoredCandidate[];
  context: {
    contentSource: {
      title: string;
      rawContent: string;
    };
    intelligence: {
      summary: string;
      coreThesis: string | null;
      topics: string[];
      technicalConcepts: string[];
    };
    ideas: { id: string; title: string; summary: string; angle: string }[];
    profile: {
      expertise: string[];
      topics: string[];
      primaryGoal: string;
    };
    audiences: { id: string; name: string; description: string | null }[];
    platforms: Record<string, unknown>; // Simplified platform definitions passed in
  };
};

export async function evaluateStrategiesWithAi(input: AiEvaluatorInput): Promise<AiStrategyRecommendation[]> {
  const prompt = `
You are the strategic distribution engine for an expert creator.
Your job is to evaluate a set of distribution strategy candidates and provide a semantic score, rationale, and execution angle.

DO NOT generate the actual post or content. Only provide strategic reasoning.

---
CONTEXT
---
Content Title: ${input.context.contentSource.title}
Content Summary: ${input.context.intelligence.summary}
Core Thesis: ${input.context.intelligence.coreThesis || "N/A"}
Creator Expertise: ${input.context.profile.expertise.join(", ")}
Primary Goal: ${input.context.profile.primaryGoal}

Available Content Ideas:
${JSON.stringify(input.context.ideas, null, 2)}

Available Audiences:
${JSON.stringify(input.context.audiences, null, 2)}

Platform Semantics:
${JSON.stringify(input.context.platforms, null, 2)}

---
CANDIDATES TO EVALUATE
---
Evaluate the following candidate combinations. For each candidate, you must return:
1. candidateId: The exact ID provided.
2. semanticFit: A number between 0.0 and 1.0 indicating how strongly the Content Idea matches the Audience, Goal, Platform, and Format.
3. rationale: A 1-2 sentence explanation of WHY this is a good or bad fit.
4. angle: A 1-2 sentence strategic angle describing WHAT the user should emphasize.
5. confidence: A number between 0.0 and 1.0 indicating your confidence in this evaluation.

Candidates:
${JSON.stringify(
  input.candidates.map(c => ({
    candidateId: c.id,
    ideaId: c.contentIdeaId,
    audienceId: c.audienceId,
    platform: c.platformId,
    format: c.formatId,
    action: c.actionId
  })), 
  null, 2
)}
`;

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  candidateId: { type: "string" },
                  semanticFit: { type: "number" },
                  rationale: { type: "string" },
                  angle: { type: "string" },
                  confidence: { type: "number" }
                },
                required: ["candidateId", "semanticFit", "rationale", "angle", "confidence"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    if (!response.text) return [];
    
    const parsed = JSON.parse(response.text);
    return parsed.recommendations as AiStrategyRecommendation[];
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    // Return empty array to gracefully fallback to deterministic scores if AI fails
    return [];
  }
}
