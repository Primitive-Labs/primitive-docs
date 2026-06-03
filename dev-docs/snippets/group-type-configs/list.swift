import JsBaoClient

// List every group type configuration for the current app. Returns the typed
// `[GroupTypeConfigInfo]`.
func list(client: JsBaoClient) async throws {
  // #region example
  let configs = try await client.groupTypeConfigs.list()
  // #endregion example
  _ = configs
}
