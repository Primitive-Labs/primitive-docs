import JsBaoClient

// Replace N per-id integration calls with ONE call to the provider's bulk
// endpoint. The integration's TOML must allow the bulk path and forward the
// query param (e.g. `forwardQueryParams = ["symbols"]`).
func fetchQuotes(client: JsBaoClient, symbols: [String]) async throws {
  // #region example
  let response = try await client.integrations.call(IntegrationCallRequest(
    integrationKey: "yahoo-finance",
    method: "GET",
    path: "/v7/finance/quote",
    query: ["symbols": symbols.joined(separator: ",")]
  ))
  // #endregion example
  _ = response
}
