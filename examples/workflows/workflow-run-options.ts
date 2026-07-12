import type { JsBaoClient } from "js-bao-wss-client";

// The full option and result surface for run management: start with every
// option, terminate a run, and page through recent runs.
export async function manageWorkflowRuns(client: JsBaoClient) {
  // #region example
  const result = await client.workflows.start({
    workflowKey: "my-workflow",
    input: { text: "hello" }, // optional, default {}
    runKey: "order-1234", // optional, idempotency key — auto-generated otherwise
    contextDocId: "doc-id", // optional
    meta: { source: "api" }, // optional, max 1KB
    forceRerun: false, // optional — terminate existing run with same key
  });
  // → { runId, runKey, instanceId, status, existing? }

  const status = await client.workflows.getStatus({
    workflowKey: "my-workflow",
    runKey: result.runKey,
    contextDocId: "doc-id", // optional, must match the start call's scope
  });
  // → { status, output?, error?, run? }
  // status.status: "running" | "complete" | "failed" | "terminated" |
  //                "apply_pending" | "apply_claimed"
  // (NOTE: "complete", not "completed", in this method)

  await client.workflows.terminate({
    workflowKey: "my-workflow",
    runKey: result.runKey,
    contextDocId: "doc-id",
  });

  const { items, cursor } = await client.workflows.listRuns({
    workflowKey: "my-workflow",
    status: "completed", // run records use "completed" (WorkflowRunStatus)
    limit: 50,
  });
  // → { items: WorkflowRun[], cursor? } — each { runId, runKey, workflowKey,
  //   status, startedAt?, endedAt?, errorMessage, meta?, ... }
  // #endregion example
  return { status, items, cursor };
}
