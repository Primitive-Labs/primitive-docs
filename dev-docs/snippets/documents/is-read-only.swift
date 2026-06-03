import JsBaoClient

// Check whether a document is read-only for the current user (reader
// permission). Synchronous local read.
func isReadOnly(client: JsBaoClient, documentId: String) {
  // #region example
  let readOnly = client.documents.isReadOnly(documentId: documentId)
  // #endregion example
  _ = readOnly
}
