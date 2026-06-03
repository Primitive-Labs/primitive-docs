import JsBaoClient

// Re-check every registered per-run waiter against the server's current
// state. Call after the client reconnects to pick up applies whose
// workflowStatus events were missed while offline.
func recheckPendingRuns(client: JsBaoClient) async throws {
  // #region example
  await client.workflows.recheckPendingRuns()
  // #endregion example
}
