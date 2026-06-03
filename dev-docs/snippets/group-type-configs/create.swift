import JsBaoClient

// Create a new group type configuration with the typed
// `CreateGroupTypeConfigParams`.
func create(client: JsBaoClient, ruleSetId: String) async throws {
  // #region example
  let config = try await client.groupTypeConfigs.create(
    params: CreateGroupTypeConfigParams(
      groupType: "team",
      ruleSetId: ruleSetId,
      autoAddCreator: true
    )
  )
  // #endregion example
  _ = config
}
