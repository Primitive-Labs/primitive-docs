import JsBaoClient

// Fetch the configuration for one database type. Returns a typed
// `DatabaseTypeConfigInfo`.
func get(client: JsBaoClient, databaseType: String) async throws {
  // #region example
  let config = try await client.databaseTypeConfigs.get(databaseType: databaseType)
  let ruleSetId = config.ruleSetId
  // #endregion example
  _ = (config, ruleSetId)
}
