import JsBaoClient

// Evaluate a rule set against a simulated request. Swift takes an untyped
// `[String: Any]` data dict (no `TestRuleSetParams`) and returns an untyped
// `[String: Any]` (no `RuleSetTestResult`), so `allowed` is hand-cast.
func test(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let result = try await client.ruleSets.test(ruleSetId: ruleSetId, data: [
    "category": "documents",
    "operation": "write",
    "user": ["userId": "user_123", "role": "editor"],
  ])
  let allowed = result["allowed"] as? Bool ?? false
  // #endregion example
  _ = allowed
}
