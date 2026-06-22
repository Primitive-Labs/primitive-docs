import type { JsBaoClient } from "js-bao-wss-client";

// Direct record access (owner/manager only): connect() returns a DoDb handle
// whose methods address records by model name.
// For most apps, prefer registered operations over this path.
export async function recordCrud(client: JsBaoClient, databaseId: string) {
  // #region example
  const db = client.databases.connect(databaseId);

  // Save (upsert).
  await db.save("tasks", { id: "task-1", title: "Ship v1" });

  // Insert only — fails if the record already exists.
  await db.save("tasks", { id: "task-3", title: "Draft" }, { ifNotExists: true });

  // Conditional write — only proceeds if the existing record matches.
  await db.save("tasks", { id: "task-3", title: "Draft" }, { condition: { completed: false } });

  // Seed StringSet fields on the write.
  await db.save("tasks", { id: "task-4", title: "Tagged" }, { stringSets: { tags: ["featured", "sale"] } });

  // Patch (partial update) — only the provided fields change.
  await db.patch("tasks", "task-1", { priority: 5 });
  await db.patch("tasks", "task-1", { priority: 7 }, { condition: { completed: false } });

  // Find a single record by id (or null).
  const task = await db.find("tasks", "task-1");

  // Delete — true if a record existed.
  const deleted = await db.delete("tasks", "task-2");

  // Count, optionally filtered.
  const total = await db.count("tasks");
  const open = await db.count("tasks", { completed: false });
  // #endregion example
  return { task, deleted, total, open };
}
