import type { JsBaoClient } from "js-bao-wss-client";

// Fires when a workflow run reaches a terminal status (completed/failed/terminated).
export function workflowStatus(client: JsBaoClient) {
  // #region example
  client.on("workflowStatus", (payload) => {
    console.log(payload.workflowKey, "->", payload.status);
  });
  // #endregion example
}
