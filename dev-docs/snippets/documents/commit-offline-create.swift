import JsBaoClient

// Commit a locally-created (localOnly) document to the server, namespaced under
// `documents.*`. Returns a typed CommitOfflineCreateResult.
func commitOfflineCreate(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.commitOfflineCreate(
    documentId: documentId,
    options: CommitOfflineCreateOptions(onExists: .link)
  )
  // #endregion example
  _ = result // CommitOfflineCreateResult(created:linked:reason:)
}
