import type { SubmissionRecord } from "@shared/api";

const memoryStore: SubmissionRecord[] = [];

export interface SubmissionFilter {
  limit?: number;
}

export async function saveSubmission(sub: SubmissionRecord): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    memoryStore.unshift(sub);
    if (memoryStore.length > 200) memoryStore.pop();
    return;
  }
  try {
    const mod: any = await import("mongodb");
    const client = new mod.MongoClient(uri);
    await client.connect();
    const dbName = process.env.MONGODB_DB || "algojudge";
    const col = client.db(dbName).collection("submissions");
    await col.insertOne(sub);
    await client.close();
  } catch (err) {
    // Fallback to memory if mongo is unavailable
    memoryStore.unshift(sub);
    if (memoryStore.length > 200) memoryStore.pop();
  }
}

export async function listSubmissions(filter: SubmissionFilter = {}): Promise<SubmissionRecord[]> {
  const limit = filter.limit ?? 20;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return memoryStore.slice(0, limit);
  }
  try {
    const mod: any = await import("mongodb");
    const client = new mod.MongoClient(uri);
    await client.connect();
    const dbName = process.env.MONGODB_DB || "algojudge";
    const col = client.db(dbName).collection("submissions");
    const docs = await col
      .find({}, { sort: { createdAt: -1 } })
      .limit(limit)
      .toArray();
    await client.close();
    return docs as SubmissionRecord[];
  } catch (err) {
    return memoryStore.slice(0, limit);
  }
}
