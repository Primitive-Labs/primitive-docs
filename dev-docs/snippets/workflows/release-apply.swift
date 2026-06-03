import JsBaoClient

// Release a claimed apply so another client can retry. Sends the run back
// to `apply_pending`. The high-level helpers call this automatically when
// an apply handler throws.
func releaseApply(
  client: JsBaoClient,
  workflowKey: String,
  runKey: String,
  contextDocId: String
) async throws {
  // #region example
  let result = try await client.workflows.releaseApply(
    workflowKey: workflowKey,
    runKey: runKey,
    contextDocId: contextDocId
  )
  // result["released"]
  // #endregion example
  _ = result
}
