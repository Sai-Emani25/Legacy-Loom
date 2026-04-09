import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface WisdomGraph {
  events: Array<{
    title: string;
    date?: string;
    description: string;
    historicalContext?: string;
    impactMetrics?: string;
  }>;
  people: Array<{
    name: string;
    role: string;
    description: string;
  }>;
  locations: Array<{
    name: string;
    significance: string;
  }>;
  wisdom: Array<{
    lesson: string;
    context: string;
  }>;
  artifacts: Array<{
    name: string;
    type: "recipe" | "song" | "tool" | "dialect" | "other";
    description: string;
  }>;
  goldenThreads: Array<{
    theme: string;
    evidence: string;
  }>;
}

export async function weaveWisdom(transcript: string): Promise<WisdomGraph> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Process the following oral history transcript as the "Chronos Architect". 
        
        Your goal is to weave this conversational data into a structured "Wisdom Graph".
        
        1. Contextual Unpacking: Handle non-linear storytelling. Attribute memories to correct chronological context.
        2. Entity Extraction: Identify EventNodes, PersonNodes, LocationNodes, WisdomNodes, and CulturalArtifactNodes.
        3. Historical Enrichment: For major historical events mentioned, use your internal knowledge and search capabilities to find exact dates, locations, and impact metrics.
        4. Implicit Value Detection: Identify "Golden Threads"—recurring life themes or philosophies.

        Transcript:
        ${transcript}` }]
      }
    ],
    config: {
      systemInstruction: `You are the "Chronos Architect," a precise knowledge engineer for oral history preservation. 
      You prioritize the dignity of the storyteller. 
      You output a structured JSON Wisdom Graph.
      
      Schema:
      {
        "events": [{"title": string, "date": string, "description": string, "historicalContext": string, "impactMetrics": string}],
        "people": [{"name": string, "role": string, "description": string}],
        "locations": [{"name": string, "significance": string}],
        "wisdom": [{"lesson": string, "context": string}],
        "artifacts": [{"name": string, "type": "recipe" | "song" | "tool" | "dialect" | "other", "description": string}],
        "goldenThreads": [{"theme": string, "evidence": string}]
      }`,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    return JSON.parse(response.text || "{}") as WisdomGraph;
  } catch (e) {
    console.error("Failed to parse Wisdom Graph:", e);
    throw new Error("The Architect encountered an error weaving the wisdom.");
  }
}
