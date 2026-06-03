import JsBaoClient

// Swift-only — the JS client doesn't expose a catalog `get()`.
func get(client: JsBaoClient, integrationIdOrKey: String) async throws {
  // #region example
  let integration = try await client.integrations.get(
    integrationIdOrKey: integrationIdOrKey
  )
  // #endregion example
  _ = integration
}
