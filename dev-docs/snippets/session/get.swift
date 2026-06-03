import JsBaoClient

// Retrieve information about the current authenticated session as a typed
// `SessionInfo`.
func get(client: JsBaoClient) async throws {
  // #region example
  let session = try await client.session.get()
  let sessionId = session.sessionId
  // #endregion example
  _ = sessionId
}
