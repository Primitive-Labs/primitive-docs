import JsBaoClient

// List rule sets. Swift takes a positional `resourceType:` filter (no
// `ListRuleSetsOptions` object) and returns untyped `[[String: Any]]`.
func list(client: JsBaoClient) async throws {
  // #region example
  let ruleSets = try await client.ruleSets.list(resourceType: "document")
  // #endregion example
  _ = ruleSets
}
