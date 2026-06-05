import JsBaoClient

// Poll the status of a run.
func getStatus(client: JsBaoClient, workflowKey: String, runKey: String) async throws {
  // #region example
  let status = try await client.workflows.getStatus(
    workflowKey: workflowKey,
    runKey: runKey
  )
  // status.status / status.output / status.error / status.run
  // #endregion example
  _ = status
}
