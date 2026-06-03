import JsBaoClient

// List every collection type configuration for the current app. Returns a
// typed `[CollectionTypeConfigInfo]`.
func list(client: JsBaoClient) async throws {
  // #region example
  let configs = try await client.collectionTypeConfigs.list()
  // #endregion example
  _ = configs
}
