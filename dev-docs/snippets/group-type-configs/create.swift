import JsBaoClient

// Create a new group type configuration. Swift takes an untyped `[String: Any]`
// params dictionary in place of `CreateGroupTypeConfigParams`.
func create(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let config = try await client.groupTypeConfigs.create(params: [
    "groupType": "team",
    "ruleSetId": ruleSetId,
    "autoAddCreator": true,
  ])
  // #endregion example
  _ = config
}
