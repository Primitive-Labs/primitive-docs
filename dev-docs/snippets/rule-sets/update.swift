import JsBaoClient

// Update a rule set. Swift takes an untyped `[String: Any]` params dict
// (no `UpdateRuleSetParams`) and returns an untyped envelope.
func update(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let ruleSet = try await client.ruleSets.update(
    ruleSetId: ruleSetId,
    params: ["description": "Updated policy"]
  )
  // #endregion example
  _ = ruleSet
}
