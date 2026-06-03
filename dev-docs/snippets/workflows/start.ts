import type { JsBaoClient } from "js-bao-wss-client";

// Start a workflow run. `runKey` makes the start idempotent.
export async function start(
  client: JsBaoClient,
  workflowKey: string,
  contextDocId: string,
) {
  // #region example
  const run = await client.workflows.start({
    workflowKey,
    input: { topic: "spring planting" },
    runKey: "run-001",
    contextDocId,
  });
  // run.runId / run.runKey / run.status / run.existing
  // #endregion example
  return run;
}
