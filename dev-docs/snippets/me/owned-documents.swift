import JsBaoClient

// List documents the current user owns. Swift returns a typed `[DocumentInfo]`
// and accepts `cursor`/`limit`/`tag` plus the full `MeOwnedDocumentsOptions`
// set; use `ownedDocumentsPage(...)` for the `{ items, cursor }` page envelope.
func ownedDocuments(client: JsBaoClient) async throws {
  // #region example
  let docs = try await client.me.ownedDocuments(limit: 50, tag: "project")
  for doc in docs {
    print(doc.documentId, doc.title)
  }
  // #endregion example
  _ = docs
}
