import JsBaoClient

// Evaluate a rule set against a simulated request via typed `TestRuleSetParams`,
// returning a typed `RuleSetTestResult`.
func test(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let result = try await client.ruleSets.test(ruleSetId: ruleSetId, data: TestRuleSetParams(
    category: "documents",
    operation: "write",
    user: TestRuleSetUser(userId: "user_123", role: "editor")
  ))
  let allowed = result.allowed
  // #endregion example
  _ = allowed
}
