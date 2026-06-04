import JsBaoClient

// Update a rule set's name, description, or rules via typed `UpdateRuleSetParams`.
func update(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let ruleSet = try await client.ruleSets.update(
    ruleSetId: ruleSetId,
    params: UpdateRuleSetParams(description: "Updated policy")
  )
  // #endregion example
  _ = ruleSet
}
