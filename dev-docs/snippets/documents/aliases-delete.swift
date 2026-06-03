import JsBaoClient

// Delete a document alias. Swift takes positional args.
func aliasesDelete(client: JsBaoClient) async throws {
  // #region example
  try await client.documents.aliases.delete(scope: "user", aliasKey: "notes")
  // #endregion example
}
