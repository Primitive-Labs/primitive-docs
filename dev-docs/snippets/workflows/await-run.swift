import JsBaoClient

// Reconnect to an existing run and await its output. Use on app resume or
// document reopen to pick up a run started in a previous session; works
// across apply_pending / running / completed states.
func awaitRun(client: JsBaoClient, workflowKey: String, runKey: String, contextDocId: String) async throws {
  // #region example
  let ctx = try await client.workflows.awaitRun(
    workflowKey: workflowKey,
    runKey: runKey,
    contextDocId: contextDocId,
    timeout: 120
  )
  // ctx.output
  // #endregion example
  _ = ctx
}
