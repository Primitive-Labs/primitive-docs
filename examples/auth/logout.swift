import JsBaoClient

// Sign the user out, optionally wiping locally cached data.
func signOut(client: JsBaoClient) async throws {
  // #region example
  try await client.auth.logout(options: LogoutOptions(
    wipeLocal: true // delete locally cached document data + KV cache
  ))
  // Fires `auth:logout` immediately and `auth:logout:complete` when finished.
  // #endregion example
}
