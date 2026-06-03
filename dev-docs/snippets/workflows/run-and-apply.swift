import JsBaoClient

// Start a workflow and await its applied output in one call. Tracks each
// invocation by runKey so N parallel runs of the same key coexist. Terminal
// non-success statuses throw `WorkflowsAPI.WorkflowRunError`.
func runAndApply(client: JsBaoClient, workflowKey: String, contextDocId: String) async throws {
  // #region example
  let ctx = try await client.workflows.runAndApply(
    workflowKey: workflowKey,
    input: ["topic": "spring planting"],
    options: StartWorkflowOptions(contextDocId: contextDocId),
    timeout: 120
  )
  // ctx.output / ctx.runKey / ctx.runId
  // #endregion example
  _ = ctx
}
