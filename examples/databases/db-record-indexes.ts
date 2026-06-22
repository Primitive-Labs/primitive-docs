import type { JsBaoClient } from "js-bao-wss-client";

// Index management on a DoDb handle. Add indexes to every field you filter or
// sort on; without one the engine scans all records of that model.
export async function manageIndexes(client: JsBaoClient, databaseId: string) {
  const db = client.databases.connect(databaseId);
  // #region example
  // Register indexes (additive — never drops).
  await db.registerIndex("tasks", "category", "string");
  await db.registerIndex("tasks", "priority", "number");
  await db.registerIndex("appUsers", "email", "string", true); // unique

  // Composite unique constraint across multiple fields.
  await db.registerUniqueConstraint("categories", "name_parentId", ["name", "parentId"]);

  // List and drop.
  const indexes = await db.listIndexes("tasks");
  await db.dropIndex("tasks", "category");

  const constraints = await db.listUniqueConstraints("categories");
  await db.dropUniqueConstraint("categories", "name_parentId");

  // Sync every model passed in the models array at init.
  await db.syncAllIndexes();
  // #endregion example
  return { indexes, constraints };
}
