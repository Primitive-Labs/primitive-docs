import JsBaoClient

// Call an integration and read the structured proxy response fields.
func callIntegrationWithResponse(client: JsBaoClient) async throws {
  // #region example
  let response = try await client.integrations.call(IntegrationCallRequest(
    integrationKey: "open-ai",
    method: "POST",
    path: "/v1/responses",
    body: ["model": "gpt-4.1-mini", "input": "hi"]
  ))

  print(response.status)     // upstream HTTP status (Int)
  print(response.headers)    // [String: String]
  print(response.body as Any) // upstream body, parsed if JSON
  print(response.traceId as Any)    // optional, correlates with admin logs
  print(response.durationMs as Any) // optional, proxy-side duration
  print(response.errorCode as Any)  // optional, set when status >= 400
  // #endregion example
  _ = response
}
