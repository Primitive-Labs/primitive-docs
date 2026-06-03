import JsBaoClient

// List every collection in the app (admin-only). Swift takes positional
// `limit`/`cursor` args (not `PaginationOptions` like its siblings) and
// returns an untyped `[String: Any]` envelope.
func listAll(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.collections.listAll(limit: 100)
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
