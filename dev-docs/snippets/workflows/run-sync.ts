import type { JsBaoClient } from "js-bao-wss-client";

// Synchronously invoke a workflow and await its final envelope. Only valid
// for workflows marked `syncCallable: true`. Every non-transport outcome
// RESOLVES (failure/timeout surface as `status`, not a throw).
export async function runSync(
  client: JsBaoClient,
  workflowKey: string,
  contextDocId: string,
) {
  // #region example
  const result = await client.workflows.runSync({
    workflowKey,
    input: { topic: "spring planting" },
    contextDocId,
    timeoutMs: 5000,
  });
  if (result.status === "completed") {
    // result.output is the final workflow output
  }
  // status: "completed" | "failed" | "terminated" | "timeout" | "apply_pending"
  // #endregion example
  return result;
}
