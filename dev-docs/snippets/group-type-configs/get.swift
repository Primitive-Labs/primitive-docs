import JsBaoClient

// Fetch the configuration for one group type. Returns the typed
// `GroupTypeConfigInfo`. The `groupType` path segment is percent-encoded.
func get(client: JsBaoClient, groupType: String) async throws {
  // #region example
  let config = try await client.groupTypeConfigs.get(groupType: groupType)
  let autoAddCreator = config.autoAddCreator
  // #endregion example
  _ = (config, autoAddCreator)
}
