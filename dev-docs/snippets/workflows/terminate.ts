import type { JsBaoClient } from "js-bao-wss-client";

// Terminate a running workflow.
export async function terminate(
  client: JsBaoClient,
  workflowKey: string,
  runKey: string,
) {
  // #region example
  const result = await client.workflows.terminate({ workflowKey, runKey });
  // #endregion example
  return result;
}
