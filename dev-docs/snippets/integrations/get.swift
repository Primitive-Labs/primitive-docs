import JsBaoClient

// Swift-only and runtime-broken (#993): no JS equivalent and no backing server
// route, so this returns `nil` in practice. Returns `IntegrationInfo?`.
func get(client: JsBaoClient, integrationIdOrKey: String) async throws {
  // #region example
  let integration: IntegrationInfo? = try await client.integrations.get(
    integrationIdOrKey: integrationIdOrKey
  )
  print(integration?.name ?? "not found")
  // #endregion example
  _ = integration
}
