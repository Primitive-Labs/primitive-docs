import JsBaoClient

// Start a workflow from app code, check its status, and list recent runs.
func startWorkflow(client: JsBaoClient) async throws {
  // #region example
  // Start a workflow; it runs in the background
  let started = try await client.workflows.start(
    workflowKey: "welcome-email",
    input: ["userName": "Alice", "userEmail": "alice@example.com"]
  )
  let runKey = started.runKey

  // Check status
  let status = try await client.workflows.getStatus(
    workflowKey: "welcome-email", runKey: runKey
  )

  // List recent runs
  let runs = try await client.workflows.listRuns(
    options: ListWorkflowRunsOptions(workflowKey: "welcome-email", limit: 50)
  )
  // #endregion example
  _ = (started.runId, status, runs.items)
}
