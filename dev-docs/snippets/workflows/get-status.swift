import JsBaoClient

// Poll the status of a run. The Swift envelope adds a `normalizedStatus`
// field that reconciles the CF and DB status shapes.
func getStatus(client: JsBaoClient, workflowKey: String, runKey: String) async throws {
  // #region example
  let status = try await client.workflows.getStatus(
    workflowKey: workflowKey,
    runKey: runKey
  )
  // status["normalizedStatus"] / status["status"] / status["run"]
  // #endregion example
  _ = status
}
