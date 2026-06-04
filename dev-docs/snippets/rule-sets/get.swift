import JsBaoClient

// Retrieve a single rule set by its ID. Swift returns a typed `RuleSetInfo`.
func get(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let ruleSet = try await client.ruleSets.get(ruleSetId: ruleSetId)
  // #endregion example
  _ = ruleSet
}
