import JsBaoClient

// Sign the user out. Swift exposes only `wipeLocal` — there is no
// `redirectTo` / `revokeOffline` / `clearOfflineIdentity` / `waitForDisconnect`.
func logout(client: JsBaoClient) async throws {
  // #region example
  try await client.logout(wipeLocal: true)
  // #endregion example
}
