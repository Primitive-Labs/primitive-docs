import JsBaoClient

// List rule sets, optionally filtered via a typed `ListRuleSetsOptions` object.
func list(client: JsBaoClient) async throws {
  // #region example
  let ruleSets = try await client.ruleSets.list(options: ListRuleSetsOptions(resourceType: "document"))
  // #endregion example
  _ = ruleSets
}
