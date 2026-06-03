import JsBaoClient

// List every database type configuration for the current app. Returns a typed
// `[DatabaseTypeConfigInfo]`.
func list(client: JsBaoClient) async throws {
  // #region example
  let configs = try await client.databaseTypeConfigs.list()
  // #endregion example
  _ = configs
}
