import JsBaoClient

// Delete a document alias with a typed `AliasRef`.
func aliasesDelete(client: JsBaoClient) async throws {
  // #region example
  try await client.documents.aliases.delete(
    AliasRef(scope: .user, aliasKey: "notes")
  )
  // #endregion example
}
