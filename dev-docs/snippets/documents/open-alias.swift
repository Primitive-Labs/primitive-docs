import JsBaoClient

// Resolve an alias and open the document it points at in one call. Both clients
// return `{ doc, metadata }` (Swift `OpenDocumentResult`).
func openAlias(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.openAlias(
    AliasRef(scope: .user, aliasKey: "notes")
  )
  let doc = result.doc
  // #endregion example
  _ = doc
}
