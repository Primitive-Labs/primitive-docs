import JsBaoClient

// Commit a locally-created (localOnly) document to the server. On Swift this is
// a top-level client method rather than a `documents.*` namespaced one.
func commitOfflineCreate(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.commitOfflineCreate(
    documentId: documentId,
    onExists: "link"
  )
  // #endregion example
  _ = result // ["created": true] / ["linked": true] / ["reason": "exists"]
}
