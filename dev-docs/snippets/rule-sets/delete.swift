import JsBaoClient

// Delete a rule set by its ID. Swift returns a typed `SuccessResult`, matching
// JS's `{ success: boolean }`.
func deleteRuleSet(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let result = try await client.ruleSets.delete(ruleSetId: ruleSetId)
  let success = result.success
  // #endregion example
  _ = success
}
