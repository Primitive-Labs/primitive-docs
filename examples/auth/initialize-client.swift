import JsBaoClient

// Stand-alone client setup — no template app required.
// Construct the client, then await the auth bootstrap (restores any
// persisted session) before using it.
func setupClient() async throws -> JsBaoClient {
  // #region example
  let client = JsBaoClient(options: JsBaoClientOptions(
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID"
  ))

  // Wait for the bootstrap to restore a persisted session (if any).
  try await client.waitForAuthBootstrap()
  if client.isAuthenticated() {
    let userId = try await client.waitForUserId(timeout: 5)
    print("signed in as \(userId)")
  }
  // #endregion example
  return client
}
