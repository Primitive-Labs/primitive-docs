import type { JsBaoClient } from "js-bao-wss-client";

// Register an apply handler so a client deterministically runs follow-up logic
// exactly once for a workflow with requiresClientApply = true. Register
// define() before start() so the apply can't arrive before the handler exists.
export function defineApplyHandler(client: JsBaoClient) {
  // #region example
  client.workflows.define("my-workflow-key", {
    onApply: async ({ output, workflowKey, runKey, runId, contextDocId, startedByUserId, meta }) => {
      // Runs on exactly one connected client.
      if (!contextDocId) return;
      const { doc } = await client.documents.open(contextDocId);
      doc?.getMap("data").set("result", output);
    },
  });
  // #endregion example
}
