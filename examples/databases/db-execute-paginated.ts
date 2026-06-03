import type { JsBaoClient } from "js-bao-wss-client";

// Execute a registered query operation with pagination controls. Callers may
// override limit/cursor/direction; the effective limit is min(definition, caller).
export async function listTasksPage(
  client: JsBaoClient,
  databaseId: string,
  previousCursor?: string,
) {
  // #region example
  const result = await client.databases.executeOperation(databaseId, "listTasks", {
    params: { projectId: "proj-1" },
    limit: 10,
    cursor: previousCursor,
    direction: 1, // 1 for forward, -1 for backward
  });
  // result: { data: [...records], hasMore: boolean, nextCursor?: string }
  // #endregion example
  return result;
}
