import JsBaoClient

// Resolve an email to an app user (to decide whether a share will land
// immediately or stay pending until signup).
func lookupUser(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.users.lookup(email: "alice@example.com")
  // { exists: true, user: { userId, name, email } } | { exists: false }
  // #endregion example
  _ = result
}
