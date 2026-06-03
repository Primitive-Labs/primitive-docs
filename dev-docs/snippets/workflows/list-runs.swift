import JsBaoClient

// List runs for the current user, optionally filtered and paginated.
func listRuns(client: JsBaoClient, workflowKey: String) async throws {
  // #region example
  let page = try await client.workflows.listRuns(
    options: ListWorkflowRunsOptions(
      workflowKey: workflowKey,
      status: "completed",
      limit: 20
    )
  )
  // page["items"] / page["cursor"]
  // #endregion example
  _ = page
}
