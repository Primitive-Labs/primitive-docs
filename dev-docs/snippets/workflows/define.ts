import type { JsBaoClient } from "js-bao-wss-client";

// Register an apply handler. Call once at app init; the client runs the
// claim -> handler -> confirm sequence automatically when a run completes
// with needsApply.
export function define(client: JsBaoClient, workflowKey: string) {
  // #region example
  client.workflows.define(workflowKey, {
    onApply: async ({ runKey, output, contextDocId }) => {
      // write `output` into the document, keyed by runKey / contextDocId
      console.log("applying", runKey, output, contextDocId);
    },
  });
  // #endregion example
}
