import JsBaoClient

// List groups, optionally filtered by type. Swift returns an untyped
// `[String: Any]` envelope; reach into "items" / "cursor" by hand.
func list(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.groups.list(options: ["type": "team", "limit": 20])
  let items = page["items"] as? [[String: Any]] ?? []
  for group in items {
    print(group["groupId"] ?? "", group["name"] ?? "")
  }
  let nextCursor = page["cursor"] as? String
  // #endregion example
  _ = nextCursor
}
