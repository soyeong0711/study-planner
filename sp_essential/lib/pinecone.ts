import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "placeholder_key",
});

const pc =
  process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== "placeholder_key"
    ? new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    : null;

export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "placeholder_key") {
    // Return a dummy 768-dimensional vector (typical for Gemini text-embedding-004)
    return new Array(768).fill(0).map(() => Math.random());
  }
  try {
    const result = (await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    })) as any;
    return result.embeddings?.[0]?.values || result.embedding?.values || new Array(768).fill(0);
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Array(768).fill(0);
  }
}

export async function upsertStudyRecord(
  userId: string,
  recordId: string,
  text: string,
  metadata: Record<string, any>
) {
  if (!pc) {
    console.log("Pinecone client not initialized (missing API key)");
    return;
  }
  try {
    const embedding = await getEmbedding(text);
    const indexName = process.env.PINECONE_INDEX_NAME || "study-planner-index";
    const index = pc.index(indexName);
    
    await index.upsert({
      records: [
        {
          id: `${userId}_${recordId}`,
          values: embedding,
          metadata: {
            userId,
            text,
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        },
      ]
    });
  } catch (error) {
    console.error("Pinecone upsert error:", error);
  }
}

export async function queryStudyRecords(userId: string, queryText: string, limit = 5) {
  if (!pc) {
    console.log("Pinecone client not initialized (missing API key)");
    return [];
  }
  try {
    const embedding = await getEmbedding(queryText);
    const indexName = process.env.PINECONE_INDEX_NAME || "study-planner-index";
    const index = pc.index(indexName);

    const response = await index.query({
      vector: embedding,
      topK: limit,
      filter: { userId: { $eq: userId } },
      includeMetadata: true,
    });
    
    return response.matches.map((m) => m.metadata) || [];
  } catch (error) {
    console.error("Pinecone query error:", error);
    return [];
  }
}
