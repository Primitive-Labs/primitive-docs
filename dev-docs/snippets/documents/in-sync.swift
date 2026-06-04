import JsBaoClient

// Check whether client and server hold identical document state via an async
// WebSocket state-vector round-trip. Resolves false when offline or on timeout.
func inSync(client: JsBaoClient, documentId: String) async {
  // #region example
  let synced = await client.documents.inSync(documentId: documentId)
  // #endregion example
  _ = synced
}
