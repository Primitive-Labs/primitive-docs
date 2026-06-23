import type { JsBaoClient } from "js-bao-wss-client";

// db.batch executes multiple writes atomically at the storage layer. It returns
// one result per input op; a per-item failure does NOT throw, so check .success.
export async function recordBatch(client: JsBaoClient, databaseId: string) {
  const db = client.databases.connect(databaseId);
  // #region example
  const results = await db.batch([
    { op: "save", modelName: "tasks", id: "t-1", data: { title: "A" } },
    { op: "patch", modelName: "tasks", id: "t-2", data: { completed: true } },
    { op: "delete", modelName: "tasks", id: "t-3" },
    { op: "increment", modelName: "tasks", id: "t-4", fields: { priority: 1 } },
    { op: "addToSet", modelName: "tasks", id: "t-5", stringSets: { tags: ["urgent"] } },
  ]);

  for (const r of results) {
    if (!r.success) console.warn("op failed:", r.id, r.error);
  }
  // #endregion example
  return results;
}
