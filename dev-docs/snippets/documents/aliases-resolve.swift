import JsBaoClient

// Resolve an alias to its document (nil if not found). Swift takes positional
// args and returns an untyped `[String: Any]?`.
func aliasesResolve(client: JsBaoClient) async throws {
  // #region example
  let alias = try await client.documents.aliases.resolve(
    scope: "user", aliasKey: "notes"
  )
  let documentId = alias?["documentId"] as? String
  // #endregion example
  _ = documentId
}
