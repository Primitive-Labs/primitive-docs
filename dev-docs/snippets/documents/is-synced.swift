import JsBaoClient

// Check whether a document's local state is synced with the server
// (synchronous local read; an alias of inSync).
func isSynced(client: JsBaoClient, documentId: String) {
  // #region example
  let synced = client.documents.isSynced(documentId: documentId)
  // #endregion example
  _ = synced
}
