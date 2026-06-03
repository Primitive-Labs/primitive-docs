import JsBaoClient

// Delete a rule set. Swift returns an untyped `[String: Any]` envelope rather
// than JS's typed `{ success: boolean }`, so the success flag is hand-cast.
func deleteRuleSet(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let result = try await client.ruleSets.delete(ruleSetId: ruleSetId)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
