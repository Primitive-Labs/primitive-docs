import JsBaoClient

// List documents the current user owns. Swift accepts only `cursor`/`limit`/`tag`
// and returns the raw `{ items, cursor? }` envelope as an untyped dictionary.
func ownedDocuments(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.me.ownedDocuments(limit: 50, tag: "project")
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
