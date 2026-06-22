import type { JsBaoClient } from "js-bao-wss-client";
import type { TaskAttrs } from "../_harness/generated/ts/Task.generated";

// Replace an N+1 (one per-item op call per parent) with ONE bulk query, then
// group the rows client-side. The bulk op carries no per-parent filter; the
// grouping happens in memory instead of in N round trips.
export async function tasksByCategory(client: JsBaoClient, databaseId: string) {
  // #region example
  const all = await client.databases.executeOperation(databaseId, "listAllTasks");
  const byCategory = new Map<string, TaskAttrs[]>();
  for (const task of all.data as TaskAttrs[]) {
    const key = task.category ?? "uncategorized";
    const list = byCategory.get(key) ?? [];
    list.push(task);
    byCategory.set(key, list);
  }
  // #endregion example
  return byCategory;
}
