import JsBaoClient

// Fetch runs awaiting client-side apply for a document. Useful on reconnect
// to recover applies whose events were missed while offline.
func getPendingApplies(client: JsBaoClient, contextDocId: String) async throws {
  // #region example
  let pending = try await client.workflows.getPendingApplies(contextDocId: contextDocId)
  // pending: [PendingApplyInfo] — one entry per run still in apply_pending
  // (read pending[i].runKey / .workflowKey / .contextDocId / .meta)
  // #endregion example
  _ = pending
}
