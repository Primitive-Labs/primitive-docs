import JsBaoClient

// Call a third-party integration through the server proxy. The response `body`
// is a `JSONValue` (inspect via accessors/subscripts) and `query` accepts
// `[String: JSONValue]`, mirroring JS's `Record<string, any>`.
func call(client: JsBaoClient, integrationKey: String) async throws {
  // #region example
  let response = try await client.integrations.call(
    IntegrationCallRequest(
      integrationKey: integrationKey,
      method: "GET",
      path: "/users/me",
      query: ["include": "profile"]
    )
  )
  let id = response.body?["id"]?.stringValue
  print(response.status, id ?? "")
  // #endregion example
  _ = response
}
