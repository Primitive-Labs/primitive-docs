import JsBaoClient

// Proxy a GET request to an external API through a configured integration.
func callIntegrationGet(client: JsBaoClient) async throws {
  // #region example
  let response = try await client.integrations.call(IntegrationCallRequest(
    integrationKey: "weather-api",
    method: "GET",
    path: "/forecast/san-francisco",
    query: ["units": "metric"]
  ))
  print(response.status, response.body as Any)
  // #endregion example
  _ = response
}
