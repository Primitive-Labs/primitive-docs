import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a workflow run starts.
export function workflowStarted(client: JsBaoClient) {
  // #region example
  client.on("workflowStarted", (payload) => {
    console.log("started", payload.workflowKey, payload.runId, payload.instanceId);
  });
  // #endregion example
}
