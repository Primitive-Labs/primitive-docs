import JsBaoClient

// Check whether the server has all of this client's writes via an async
// WebSocket state-vector round-trip. Resolves false when offline or on timeout.
func includesWrites(client: JsBaoClient, documentId: String) async {
  // #region example
  let confirmed = await client.documents.includesWrites(documentId: documentId)
  // #endregion example
  _ = confirmed
}
