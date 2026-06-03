import JsBaoClient

// Fetch the configuration for one database type. Swift returns an untyped
// `[String: Any]` instead of the typed `DatabaseTypeConfigInfo`.
func get(client: JsBaoClient, databaseType: String) async throws {
  // #region example
  let config = try await client.databaseTypeConfigs.get(databaseType: databaseType)
  let ruleSetId = config["ruleSetId"] as? String
  // #endregion example
  _ = (config, ruleSetId)
}
