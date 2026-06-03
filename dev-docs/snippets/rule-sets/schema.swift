import JsBaoClient

// Retrieve the rule set schema. Swift returns an untyped `[String: Any]`
// (no `RuleSetSchema` struct).
func schema(client: JsBaoClient) async throws {
  // #region example
  let schema = try await client.ruleSets.schema()
  // #endregion example
  _ = schema
}
