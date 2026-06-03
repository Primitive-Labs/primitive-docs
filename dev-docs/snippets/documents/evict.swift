import JsBaoClient

// Evict a single document's local data from the device. Swift takes no force
// option and does not throw.
func evict(client: JsBaoClient, documentId: String) async {
  // #region example
  await client.documents.evict(documentId: documentId)
  // #endregion example
}
