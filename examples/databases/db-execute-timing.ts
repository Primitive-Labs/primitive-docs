import type { JsBaoClient } from "js-bao-wss-client";

// Pass timing: true to get per-phase millisecond timings in result._timing.
// Works on every operation type.
export async function executeWithTiming(client: JsBaoClient, databaseId: string) {
  // #region example
  const result = await client.databases.executeOperation(databaseId, "listTasks", {
    params: { projectId: "proj-1" },
    timing: true,
  });
  // result._timing: { totalMs, databaseLookup, operationLookup, celEvaluation, ... }
  // #endregion example
  return result;
}
