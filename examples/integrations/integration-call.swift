import JsBaoClient

// Call an external API through a configured integration (server-side proxy).
func callIntegration(client: JsBaoClient) async throws {
  // #region example
  let response = try await client.integrations.call(IntegrationCallRequest(
    integrationKey: "crm-api",
    method: "POST",
    path: "/contacts",
    body: ["email": "user@example.com", "name": "Alice"]
  ))
  // #endregion example
  _ = response
}
