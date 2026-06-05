import JsBaoClient

// The full option and result surface for run management: start with every
// option, terminate a run, and page through recent runs.
func manageWorkflowRuns(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.workflows.start(
    workflowKey: "my-workflow",
    input: ["text": "hello"], // default [:]
    options: StartWorkflowOptions(
      runKey: "order-1234", // idempotency key — auto-generated otherwise
      contextDocId: "doc-id",
      meta: ["source": "api"], // max 1KB
      forceRerun: false // terminate existing run with same key
    )
  )
  // StartWorkflowResult: runId, runKey, instanceId?, status, existing?

  let status = try await client.workflows.getStatus(
    workflowKey: "my-workflow",
    runKey: result.runKey,
    contextDocId: "doc-id" // must match the start call's scope
  )
  // WorkflowStatusResult: status, output?, error?, run?
  // status.status: "running" | "complete" | "failed" | "terminated" |
  //                "apply_pending" | "apply_claimed"
  // (NOTE: "complete", not "completed", in this method)

  _ = try await client.workflows.terminate(
    workflowKey: "my-workflow",
    runKey: result.runKey,
    contextDocId: "doc-id"
  )

  let runs = try await client.workflows.listRuns(
    options: ListWorkflowRunsOptions(workflowKey: "my-workflow", status: "complete", limit: 50)
  )
  // ListWorkflowRunsResult: items ([WorkflowRunInfo]), cursor?
  // #endregion example
  _ = (status, runs.items, runs.cursor)
}
