import JsBaoClient

// Retrieve information about the current authenticated session. Swift returns
// an untyped `[String: Any]` (no `SessionInfo` struct), so fields are hand-cast.
func get(client: JsBaoClient) async throws {
  // #region example
  let session = try await client.session.get()
  let sessionId = session["sessionId"] as? String
  // #endregion example
  _ = sessionId
}
