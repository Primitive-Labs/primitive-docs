import JsBaoClient

// Update a group type configuration. Swift takes an untyped `[String: Any]`
// params dict; pass `NSNull()` for `ruleSetId` to remove the current rule set.
// Note: the Swift client does NOT percent-encode the `groupType` path segment
// (#590), unlike the JS client — prefer ASCII-safe identifiers.
func update(
  client: JsBaoClient,
  groupType: String,
  ruleSetId: String
) async throws {
  // #region example
  let config = try await client.groupTypeConfigs.update(
    groupType: groupType,
    params: [
      "ruleSetId": ruleSetId,
      "autoAddCreator": false,
    ]
  )
  // #endregion example
  _ = config
}
