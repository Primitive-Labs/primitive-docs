import JsBaoClient

// Fetch runs awaiting client-side apply for a document. Useful on reconnect
// to recover applies whose events were missed while offline.
func getPendingApplies(client: JsBaoClient, contextDocId: String) async throws {
  // #region example
  let pending = try await client.workflows.getPendingApplies(contextDocId: contextDocId)
  // pending: [[String: Any]] — one entry per run still in apply_pending
  // #endregion example
  _ = pending
}
