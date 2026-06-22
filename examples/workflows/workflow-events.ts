import type { JsBaoClient } from "js-bao-wss-client";

// React to workflow lifecycle events over the WebSocket. Requires an active
// WebSocket (e.g. from client.documents.open(docId)).
export function wireWorkflowEvents(client: JsBaoClient) {
  // #region example
  client.on("workflowStarted", (e) => {
    // { workflowKey, runId, runKey, instanceId, contextDocId?, meta? }
  });

  client.on("workflowStatus", (e) => {
    // e.status: "completed" | "failed" | "terminated"
    //   (NOTE: "completed" here, with the "d" — getStatus returns "complete")
    // e.needsApply: true if requiresClientApply and not yet applied
  });
  // #endregion example
}
