import JsBaoClient

// Check whether a document has a pending local create not yet committed.
func isPendingCreate(client: JsBaoClient, documentId: String) {
  // #region example
  let pending = client.documents.isPendingCreate(documentId: documentId)
  // #endregion example
  _ = pending
}
