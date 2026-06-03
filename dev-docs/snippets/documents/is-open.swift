import JsBaoClient

// Check whether a document is currently open (synchronous, local).
func isOpen(client: JsBaoClient, documentId: String) {
  // #region example
  let open = client.documents.isOpen(documentId: documentId)
  // #endregion example
  _ = open
}
