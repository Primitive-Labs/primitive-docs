import JsBaoClient

// Swift-only and runtime-broken (#993): no JS equivalent and no backing server
// route, so this returns `[]` in practice. Returns `[IntegrationInfo]`.
func list(client: JsBaoClient) async throws {
  // #region example
  let integrations: [IntegrationInfo] = try await client.integrations.list()
  for integration in integrations {
    print(integration.integrationKey ?? "", integration.active ?? false)
  }
  // #endregion example
  _ = integrations
}
