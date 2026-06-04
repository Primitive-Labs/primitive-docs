import JsBaoClient

// Debug rule evaluation for a real user via typed `DebugRuleSetParams`,
// returning a typed `RuleSetDebugResult` with the full evaluation trace.
func debug(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.ruleSets.debug(data: DebugRuleSetParams(
    userId: "user_123",
    groupType: "team",
    category: "documents",
    operation: "write"
  ))
  let allowed = result.allowed
  // #endregion example
  _ = allowed
}
