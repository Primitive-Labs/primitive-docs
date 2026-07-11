import JsBaoClient

// GET through a configured integration, with query parameters. The proxy
// applies the integration's defaultHeaders/staticQuery server-side.
func getForecast(client: JsBaoClient) async throws {
  // #region example
  let response = try await client.integrations.call(IntegrationCallRequest(
    integrationKey: "weather-api",
    method: "GET",
    path: "/forecast/san-francisco",
    query: ["units": "metric"]
  ))
  print(response.status, response.body ?? "")
  // #endregion example
}
