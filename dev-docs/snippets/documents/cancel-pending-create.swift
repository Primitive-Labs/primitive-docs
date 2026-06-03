import JsBaoClient

// Cancel a pending local create. Swift takes no eviction option and does not
// throw.
func cancelPendingCreate(client: JsBaoClient, documentId: String) async {
  // #region example
  await client.documents.cancelPendingCreate(documentId: documentId)
  // #endregion example
}
