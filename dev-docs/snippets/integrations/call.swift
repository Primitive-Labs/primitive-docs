import JsBaoClient

// Call a third-party integration through the server proxy. Swift's `body` is
// `Any?` (cast at the call site) and `query` is `[String: String]` only.
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
  let id = (response.body as? [String: Any])?["id"] as? String
  print(response.status, id ?? "")
  // #endregion example
  _ = response
}
