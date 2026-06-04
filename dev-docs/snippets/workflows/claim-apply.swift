import JsBaoClient

// Claim the apply lease for a run parked in `apply_pending`. The server
// grants a 30s lease; `claimed` is false (with a `reason`) if another
// client already holds it.
func claimApply(
  client: JsBaoClient,
  workflowKey: String,
  runKey: String,
  contextDocId: String
) async throws {
  // #region example
  let claim = try await client.workflows.claimApply(
    workflowKey: workflowKey,
    runKey: runKey,
    contextDocId: contextDocId
  )
  if claim.claimed {
    // safe to read the output via getStatus and apply it, then confirmApply
  }
  // #endregion example
  _ = claim
}
