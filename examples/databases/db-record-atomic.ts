import type { JsBaoClient } from "js-bao-wss-client";

// Atomic direct-record operations: numeric increment/decrement and StringSet
// add/remove. These mutate without a read-modify-write round trip.
export async function recordAtomicOps(client: JsBaoClient, databaseId: string) {
  const db = client.databases.connect(databaseId);
  // #region example
  // Increment/decrement numeric fields; returns the post-increment values.
  const newValues = await db.increment("tasks", "task-1", {
    priority: 1,
    estimatedHours: -2,
  });

  // Atomically add/remove StringSet members.
  await db.addToSet("tasks", "task-1", { tags: ["featured"] });
  await db.removeFromSet("tasks", "task-1", { tags: ["sale"] });
  // #endregion example
  return newValues;
}
