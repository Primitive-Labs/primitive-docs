import JsBaoClient

// Fetch any pending applies for a document and run them through the
// registered `define` handlers. Call after reconnect or when a document is
// opened to recover applies that fired while the client was offline.
func deliverPendingApplies(client: JsBaoClient, contextDocId: String) async throws {
  // #region example
  await client.workflows.deliverPendingApplies(contextDocId: contextDocId)
  // #endregion example
}
