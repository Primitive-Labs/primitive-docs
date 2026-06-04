import JsBaoClient

// Sign the user out, optionally wiping locally cached data.
// On Swift `logout` takes a single `wipeLocal` flag.
func signOut(client: JsBaoClient) async throws {
  // #region example
  try await client.logout(wipeLocal: true)
  // Fires `auth:logout` immediately and `auth:logout:complete` when finished.
  // #endregion example
}
