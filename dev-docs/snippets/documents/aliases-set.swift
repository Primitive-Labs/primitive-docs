import JsBaoClient

// Create or update a document alias. Swift takes positional args with a
// bare-String scope and returns an untyped `[String: Any]`.
func aliasesSet(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let alias = try await client.documents.aliases.set(
    scope: "user", aliasKey: "notes", documentId: documentId
  )
  // #endregion example
  _ = alias
}
