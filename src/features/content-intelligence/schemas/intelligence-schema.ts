import { z } from "zod";

export const contentIdeaSchema = z.object({
  title: z.string().describe("A clear, engaging title for the distinct idea."),
  summary: z.string().describe("A concise summary of what this idea is about."),
  angle: z.string().describe("The perspective or angle this idea takes (e.g., 'Contrarian', 'Educational', 'Personal Experience')."),
  sourceContext: z.string().describe("The specific context or quote from the source that supports this idea."),
  importance: z.number().min(1).max(10).describe("How important or central this idea is to the source material (1-10)."),
});

export const contentIntelligenceSchema = z.object({
  summary: z.string().describe("A high-level summary of the entire content source."),
  coreThesis: z.string().nullable().describe("The main argument or core thesis of the content, if one exists."),
  topics: z.array(z.string()).describe("High-level topics discussed in the content."),
  technicalConcepts: z.array(z.string()).describe("Specific technical concepts or jargon mentioned."),
  opinions: z.array(z.string()).describe("Explicit opinions stated by the author. Do not infer opinions that are not explicitly stated."),
  lessons: z.array(z.string()).describe("Actionable lessons or takeaways from the content."),
  examples: z.array(z.string()).describe("Specific examples or case studies provided in the content."),
  audiences: z.array(z.string()).describe("Target audiences who would find this content valuable."),
  ideas: z.array(contentIdeaSchema).describe("Distinct, independently distributable ideas extracted from the content. Do not generate variations of the same idea."),
});

export type ContentIdeaExtraction = z.infer<typeof contentIdeaSchema>;
export type ContentIntelligenceExtraction = z.infer<typeof contentIntelligenceSchema>;
