import JsBaoClient

// List documents shared with the current user. Swift returns the
// `{ items, cursor? }` envelope as an untyped dictionary (a bare network GET).
func sharedDocuments(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.me.sharedDocuments(limit: 50, tag: "shared")
  let items = result["items"] as? [[String: Any]] ?? []
  let cursor = result["cursor"] as? String
  // #endregion example
  _ = (items, cursor)
}
