import JsBaoClient

// Start a workflow run. On Swift `input` is a positional `[String: Any]`
// and the idempotency/scoping fields live on `StartWorkflowOptions`.
func start(client: JsBaoClient, workflowKey: String, contextDocId: String) async throws {
  // #region example
  let run = try await client.workflows.start(
    workflowKey: workflowKey,
    input: ["topic": "spring planting"],
    options: StartWorkflowOptions(runKey: "run-001", contextDocId: contextDocId)
  )
  // run["runId"] / run["runKey"] / run["status"] / run["existing"]
  // #endregion example
  _ = run
}
