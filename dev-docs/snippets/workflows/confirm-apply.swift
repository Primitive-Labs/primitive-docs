import JsBaoClient

// Confirm a claimed apply once the output has been written to the document.
// Conditional on the same connection that called `claimApply`.
func confirmApply(
  client: JsBaoClient,
  workflowKey: String,
  runKey: String,
  contextDocId: String
) async throws {
  // #region example
  let result = try await client.workflows.confirmApply(
    workflowKey: workflowKey,
    runKey: runKey,
    contextDocId: contextDocId
  )
  // result["confirmed"]
  // #endregion example
  _ = result
}
