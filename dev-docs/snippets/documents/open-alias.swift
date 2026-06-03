import JsBaoClient

// Resolve an alias and open the document it points at in one call. Swift
// returns the YDocument directly (vs JS's { doc, metadata }).
func openAlias(client: JsBaoClient) async throws {
  // #region example
  let doc = try await client.documents.openAlias(
    AliasRef(scope: .user, aliasKey: "notes")
  )
  // #endregion example
  _ = doc
}
