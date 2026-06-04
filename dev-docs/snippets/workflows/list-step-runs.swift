import JsBaoClient

// List the per-step records for one run (debugging: input/output/error/timing).
func listStepRuns(client: JsBaoClient, runId: String) async throws {
  // #region example
  let steps = try await client.workflows.listStepRuns(runId: runId)
  // steps.items: [WorkflowStepRunRecord]
  // #endregion example
  _ = steps
}
