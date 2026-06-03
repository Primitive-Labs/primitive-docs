import JsBaoClient

// List collections the caller is a direct member of. Swift returns an untyped
// `[String: Any]` envelope; dig out `items` with a dict cast.
func list(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.collections.list(
    options: PaginationOptions(limit: 50)
  )
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
