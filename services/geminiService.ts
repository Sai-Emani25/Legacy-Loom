import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface WisdomGraph {
  transcription: string;
  events: Array<{
    title: string;
    date?: string;
    lifecycleStage: string;
    description: string;
    historicalContext?: string;
    impactMetrics?: string;
    tags: string[];
  }>;
  people: Array<{
    name: string;
    role: string;
    description: string;
    tags: string[];
  }>;
  locations: Array<{
    name: string;
    significance: string;
    tags: string[];
  }>;
  wisdom: Array<{
    lesson: string;
    context: string;
    tags: string[];
  }>;
  artifacts: Array<{
    name: string;
    type: "recipe" | "song" | "tool" | "dialect" | "other";
    description: string;
    tags: string[];
  }>;
  goldenThreads: Array<{
    theme: string;
    evidence: string;
    tags: string[];
  }>;
  linkedEntities: Array<{
    source: string;
    target: string;
    relationship: string;
  }>;
  narrativeReport: string; // Markdown version as per Step 3
}

export interface AgentExports {
  claude: string; // CLAUDE.md
  openai: string; // Python stubs
  crewai: string; // YAML roles
  langchain: string; // Adapter code
  lyzr: string; // API payload
}

export async function generateAgentExports(graph: WisdomGraph): Promise<AgentExports> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Based on this Wisdom Graph, generate export payloads for the following 5 frameworks:
        1. Claude Code (CLAUDE.md): A project-level guide for an AI assistant.
        2. OpenAI Agents SDK: Python stub generation for an agent representing this storyteller.
        3. CrewAI: YAML role extraction for a 'Wisdom Keeper' agent.
        4. LangChain: A Python adapter class.
        5. Lyzr Studio: A JSON API payload.

        Wisdom Graph:
        ${JSON.stringify(graph)}` }]
      }
    ],
    config: {
      systemInstruction: `You are the GitAgent Export Module. You transform Wisdom Graphs into agentic souls across multiple runtimes. 
      Output a JSON object with keys: claude, openai, crewai, langchain, lyzr.`,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}") as AgentExports;
  } catch (e) {
    console.error("Failed to generate agent exports:", e);
    throw new Error("The Architect failed to export the agentic soul.");
  }
}

export async function weaveWisdom(transcript: string): Promise<WisdomGraph> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `You are processing a new narrative thread for the 'Legacy-Loom.' Analyze the following media (text transcript). Perform the following four tasks in a recursive loop:

        1. TRANSCRIBE: Provide a clean transcription, but retain original phrasing and local dialect.
        2. CHRONOLOGICAL ANCHORING: Create a timeline of the major life events discussed. Map these against the historical enrichment data you found using GOOGLE SEARCH. Include Lifecycle Stage.
        3. ENTITY GRAPHING: Identify and link [PersonNode], [LocationNode], and [WisdomNode] (life lessons/values). Define relationships.
        4. GOLDEN THREAD DETECTION: List the top 3 recurring themes or values that define this storyteller's philosophy.

        Transcript:
        ${transcript}` }]
      }
    ],
    config: {
      systemInstruction: `You are the "Legacy-Loom" Initial Weaver, an empathetic yet precise knowledge engineer for oral history preservation. 
      You prioritize the dignity of the storyteller. 
      You output a structured JSON Wisdom Graph that includes a Markdown 'narrativeReport'.
      
      Schema:
      {
        "transcription": string,
        "events": [{"title": string, "date": string, "lifecycleStage": string, "description": string, "historicalContext": string, "impactMetrics": string, "tags": string[]}],
        "people": [{"name": string, "role": string, "description": string, "tags": string[]}],
        "locations": [{"name": string, "significance": string, "tags": string[]}],
        "wisdom": [{"lesson": string, "context": string, "tags": string[]}],
        "artifacts": [{"name": string, "type": "recipe" | "song" | "tool" | "dialect" | "other", "description": string, "tags": string[]}],
        "goldenThreads": [{"theme": string, "evidence": string, "tags": string[]}],
        "linkedEntities": [{"source": string, "target": string, "relationship": string}],
        "narrativeReport": string (Markdown formatted as per the Legacy-Loom Narrative Thread Report template)
      }

      Narrative Report Template:
      ## Legacy-Loom: Narrative Thread Report
      ### 1. The Anchored Timeline
      | Estimated Date | Lifecycle Stage | Major Life Event | Historical Context Enrichment (via Google Search) |
      | :--- | :--- | :--- | :--- |
      ### 2. The Wisdom Graph (Linked Entities)
      * **[[PersonNode: Name]]** is linked to **[[LocationNode: Place]]** via relationship \`relationship\` (period).
      ### 3. Golden Threads (Recurring Themes)
      * Thread 1: [Theme Title]
      ### 4. Raw Transcript (Sample for Verification)
      > [First 30 seconds of the transcription]`,
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
