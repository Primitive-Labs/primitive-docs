import JsBaoClient

// List collections the caller is a direct member of. Each item carries a
// `permission` reflecting the caller's direct access level.
func list(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.collections.list(
    options: PaginationOptions(limit: 50)
  )
  for collection in page.items {
    print(collection.name, collection.permission as Any)
  }
  // #endregion example
  _ = page.cursor
}
