import JsBaoClient

// Debug rule evaluation for a real user. Swift takes an untyped `[String: Any]`
// data dict (no `DebugRuleSetParams`) and returns an untyped `[String: Any]`
// (no `RuleSetDebugResult`), so the trace fields are hand-cast.
func debug(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.ruleSets.debug(data: [
    "userId": "user_123",
    "groupType": "team",
    "category": "documents",
    "operation": "write",
  ])
  let allowed = result["allowed"] as? Bool ?? false
  // #endregion example
  _ = allowed
}
