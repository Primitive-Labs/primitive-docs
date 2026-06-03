import JsBaoClient

// List every database type configuration for the current app. Swift returns
// an untyped array of dictionaries rather than the typed `DatabaseTypeConfigInfo[]`.
func list(client: JsBaoClient) async throws {
  // #region example
  let configs = try await client.databaseTypeConfigs.list()
  // #endregion example
  _ = configs
}
