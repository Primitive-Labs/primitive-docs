import JsBaoClient

// Check whether a document has a local copy stored on this device.
func hasLocalCopy(client: JsBaoClient, documentId: String) {
  // #region example
  let local = client.documents.hasLocalCopy(documentId: documentId)
  // #endregion example
  _ = local
}
