import JsBaoClient

// Check whether a document's local state is synced with the server — a cheap
// synchronous local read. (inSync(...) is the async server round-trip.)
func isSynced(client: JsBaoClient, documentId: String) {
  // #region example
  let synced = client.documents.isSynced(documentId: documentId)
  // #endregion example
  _ = synced
}
