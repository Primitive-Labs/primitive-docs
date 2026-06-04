import JsBaoClient

// List groups, optionally filtered by type. Returns a typed paginated envelope.
func list(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.groups.list(options: ListGroupsOptions(type: "team", limit: 20))
  for group in page.items {
    print(group.groupId, group.name, group.memberCount)
  }
  let nextCursor = page.cursor
  // #endregion example
  _ = nextCursor
}
