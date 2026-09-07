import { GoogleGenAI } from '@google/genai';
import { contentIntelligenceSchema, type ContentIntelligenceExtraction } from '../schemas/intelligence-schema';
import { env } from '@/lib/validation/env';

// Initialize the Google GenAI SDK client
// By default, it looks for process.env.GEMINI_API_KEY
// but we pass it explicitly from our env validation.
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const MAX_CONTENT_LENGTH = 100000; // sensible V1 limit to prevent unbounded context usage

export async function analyzeContent(rawContent: string): Promise<ContentIntelligenceExtraction> {
  if (rawContent.length > MAX_CONTENT_LENGTH) {
    throw new Error("Content is too large for V1 analysis.");
  }

  const prompt = `
You are an expert analytical system extracting the intellectual structure of an existing piece of content.

Your task is to extract the structure according to the provided schema.

CRITICAL INSTRUCTIONS:
1. You are NOT rewriting, improving, generating social posts, or creating platform-specific assets.
2. DO NOT invent facts, experiences, or technical concepts. Identify ONLY information actually supported by the source.
3. For "opinions", "lessons", "examples", or "technicalConcepts", if the source does not contain them, return an empty array []. Do NOT hallucinate.
4. For "ideas" (ContentIdeas), extract genuinely distinct, independently distributable ideas. Do not create five ideas that are simply rewordings of the same point. 
5. ContentIdeas should NOT contain platform-specific content (e.g. "Here's my X post..."). They should be core concepts like "Why I chose X over Y".
6. Don't use em dashes at all

SOURCE CONTENT:
"""
${rawContent}
"""
`;

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING" },
            coreThesis: { type: "STRING", nullable: true },
            topics: { type: "ARRAY", items: { type: "STRING" } },
            technicalConcepts: { type: "ARRAY", items: { type: "STRING" } },
            opinions: { type: "ARRAY", items: { type: "STRING" } },
            lessons: { type: "ARRAY", items: { type: "STRING" } },
            examples: { type: "ARRAY", items: { type: "STRING" } },
            audiences: { type: "ARRAY", items: { type: "STRING" } },
            ideas: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  summary: { type: "STRING" },
                  angle: { type: "STRING" },
                  sourceContext: { type: "STRING" },
                  importance: { type: "INTEGER" }
                },
                required: ["title", "summary", "angle", "sourceContext", "importance"]
              }
            }
          },
          required: ["summary", "topics", "technicalConcepts", "opinions", "lessons", "examples", "audiences", "ideas"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No text output received from Gemini API.");
    }

    const parsedJson = JSON.parse(textOutput);
    // Validate the response with Zod
    const validated = contentIntelligenceSchema.parse(parsedJson);
    return validated;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze content structure from source.");
  }
}
