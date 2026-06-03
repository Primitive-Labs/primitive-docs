import JsBaoClient

// Fetch metadata for the app's shared root document. Swift returns an untyped
// `[String: Any]`.
func getRoot(client: JsBaoClient) async throws {
  // #region example
  let info = try await client.documents.getRoot()
  // #endregion example
  _ = info
}
