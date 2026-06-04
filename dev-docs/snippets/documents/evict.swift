import JsBaoClient

// Evict a single document's local data from the device. A doc with unsynced
// local changes throws unless `force: true` is passed.
func evict(client: JsBaoClient, documentId: String) async throws {
  // #region example
  try await client.documents.evict(
    documentId: documentId,
    options: EvictDocumentOptions(force: true)
  )
  // #endregion example
}
