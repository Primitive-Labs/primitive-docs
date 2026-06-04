import JsBaoClient

// There is no `triggerSource` filter on listRuns. Cron-fired runs are
// identifiable by their contextDocId starting with "cron:" (and meta.source).
func listCronRuns(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.workflows.listRuns(
    options: ListWorkflowRunsOptions(workflowKey: "send-digest")
  )
  let items = result["items"] as? [[String: Any]] ?? []
  let cronRuns = items.filter {
    ($0["contextDocId"] as? String)?.hasPrefix("cron:") ?? false
  }
  // #endregion example
  _ = cronRuns
}
