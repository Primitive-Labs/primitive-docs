import JsBaoClient

// Inspect the per-step debug records for a single workflow run.
func listWorkflowStepRuns(client: JsBaoClient, runId: String) async throws {
  // #region example
  // Fetch the per-step run records for a run (debugging / admin views)
  let result = try await client.workflows.listStepRuns(runId: runId)
  let stepRuns = result["items"] as? [[String: Any]] ?? []

  for step in stepRuns {
    // step["stepId"], step["stepKind"], step["status"], step["input"], step["output"], step["error"]
    let stepId = step["stepId"] as? String ?? ""
    let kind = step["stepKind"] as? String ?? ""
    let status = step["status"] as? String ?? ""
    print(stepId, kind, status)
  }
  // #endregion example
  _ = stepRuns
}
