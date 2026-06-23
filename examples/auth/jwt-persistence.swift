import JsBaoClient

// Opt in to JWT persistence so a relaunch can reuse the short-lived token while
// it is still valid, instead of forcing a fresh sign-in. The token is stored in
// the Keychain under `storageKeyPrefix`. `waitForAuthBootstrap()` restores any
// persisted session before the client is used.
func setupPersistedClient() async throws -> JsBaoClient {
  // #region example
  let client = JsBaoClient(options: JsBaoClientOptions(
    apiUrl: "https://primitiveapi.com",
    wsUrl: "wss://primitiveapi.com",
    appId: "YOUR_APP_ID",
    auth: AuthConfig(
      persistJwtInStorage: true,
      storageKeyPrefix: "my-app"
    )
  ))

  try await client.waitForAuthBootstrap()
  // ["mode": "persisted" | "memory", "prefix": <storageKeyPrefix>]
  let info = client.getAuthPersistenceInfo()
  // #endregion example
  _ = info
  return client
}
