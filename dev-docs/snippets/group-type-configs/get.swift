import JsBaoClient

// Fetch the configuration for one group type. Swift returns an untyped
// `[String: Any]` instead of the typed `GroupTypeConfigInfo`. Note: the Swift
// client interpolates `groupType` into the path WITHOUT percent-encoding it
// (#590), so prefer ASCII-safe group type identifiers.
func get(client: JsBaoClient, groupType: String) async throws {
  // #region example
  let config = try await client.groupTypeConfigs.get(groupType: groupType)
  let autoAddCreator = config["autoAddCreator"] as? Bool ?? false
  // #endregion example
  _ = (config, autoAddCreator)
}
