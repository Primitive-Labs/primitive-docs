import JsBaoClient

// List documents accessible to the current user. Swift returns an untyped
// `[String: Any]` envelope and only supports limit/cursor pagination.
func list(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.list(
    options: PaginationOptions(limit: 50)
  )
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
