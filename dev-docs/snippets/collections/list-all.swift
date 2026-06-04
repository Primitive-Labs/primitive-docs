import JsBaoClient

// List every collection in the app (admin-only). Unlike `list()`, items do
// NOT carry a `permission` field. Keeps positional `limit`/`cursor` params.
func listAll(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.collections.listAll(limit: 100)
  // #endregion example
  _ = page.items
}
