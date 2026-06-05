import JsBaoClient

// Inspect the per-step debug records for a single workflow run.
func listWorkflowStepRuns(client: JsBaoClient, runId: String) async throws {
  // #region example
  // Fetch the per-step run records for a run (debugging / admin views)
  let stepRuns = try await client.workflows.listStepRuns(runId: runId).items

  for step in stepRuns {
    // step.stepId, step.stepKind, step.status, step.input, step.output, step.error
    print(step.stepId ?? "", step.stepKind ?? "", step.status)
  }
  // #endregion example
  _ = stepRuns
}
