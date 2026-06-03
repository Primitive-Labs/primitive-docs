import type { JsBaoClient } from "js-bao-wss-client";

// Poll the status of a run. Omit contextDocId to use the user's root document.
export async function getStatus(
  client: JsBaoClient,
  workflowKey: string,
  runKey: string,
) {
  // #region example
  const status = await client.workflows.getStatus({ workflowKey, runKey });
  // status.status / status.output / status.error / status.run
  // #endregion example
  return status;
}
