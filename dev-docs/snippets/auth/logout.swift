import JsBaoClient

// Sign the user out via the typed `client.auth` namespace. `LogoutOptions`
// honors `wipeLocal` / `revokeOffline` / `clearOfflineIdentity` /
// `waitForDisconnect`. Swift still skips the server `/auth/logout` cookie-clear
// POST, so the session cookie can linger server-side.
func logout(client: JsBaoClient) async throws {
  // #region example
  try await client.auth.logout(
    options: LogoutOptions(revokeOffline: true, wipeLocal: true)
  )
  // #endregion example
}
