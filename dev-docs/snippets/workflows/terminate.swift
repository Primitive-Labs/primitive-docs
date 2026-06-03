import JsBaoClient

// Terminate a running workflow. Pass the same `contextDocId` the run was
// started with so the server can route to the right per-document instance.
func terminate(client: JsBaoClient, workflowKey: String, runKey: String) async throws {
  // #region example
  let result = try await client.workflows.terminate(
    workflowKey: workflowKey,
    runKey: runKey
  )
  // #endregion example
  _ = result
}
