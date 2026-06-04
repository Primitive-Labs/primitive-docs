import JsBaoClient

// Retrieve the rule set schema. Swift returns a typed `RuleSetSchema`
// (`resourceTypes` is an opaque `[String: JSONValue]` map).
func schema(client: JsBaoClient) async throws {
  // #region example
  let schema = try await client.ruleSets.schema()
  // #endregion example
  _ = schema
}
