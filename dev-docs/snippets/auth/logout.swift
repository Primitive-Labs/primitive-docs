import JsBaoClient

// Sign the user out via the typed `client.auth` namespace. `LogoutOptions`
// accepts `wipeLocal` / `revokeOffline` / `clearOfflineIdentity` for JS parity,
// but the Swift controller currently only honors `wipeLocal` and skips the
// server `/auth/logout` cookie clear — it tears down local state only.
func logout(client: JsBaoClient) async throws {
  // #region example
  try await client.auth.logout(options: LogoutOptions(wipeLocal: true))
  // #endregion example
}
