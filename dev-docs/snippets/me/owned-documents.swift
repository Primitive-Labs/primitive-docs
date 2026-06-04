import JsBaoClient

// List documents the current user owns. Swift returns a typed `[DocumentInfo]`
// and accepts `cursor`/`limit`/`tag` (a bare network GET — the offline-first
// option set and cache-merge are a deferred feature gap, #938).
func ownedDocuments(client: JsBaoClient) async throws {
  // #region example
  let docs = try await client.me.ownedDocuments(limit: 50, tag: "project")
  for doc in docs {
    print(doc.documentId, doc.title)
  }
  // #endregion example
  _ = docs
}
