import type { JsBaoClient } from "js-bao-wss-client";

// The CEL context stores per-database values that operations and triggers
// reference via $database.celContext.* (or the legacy $database.metadata.*).
export async function updateCelContext(client: JsBaoClient, databaseId: string) {
  // #region example
  await client.databases.updateCelContext(databaseId, {
    teamId: "team-alpha",
    projectId: "proj-1",
  });
  // #endregion example
}
