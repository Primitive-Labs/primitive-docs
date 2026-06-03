import JsBaoClient

// Swift-only — the JS client doesn't expose a catalog `list()`.
func list(client: JsBaoClient) async throws {
  // #region example
  let integrations = try await client.integrations.list()
  // #endregion example
  _ = integrations
}
