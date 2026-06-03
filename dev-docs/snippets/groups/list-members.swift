import JsBaoClient

// List members of a group, with optional pagination. Swift takes a typed
// `PaginationOptions` but returns an untyped `[String: Any]` envelope.
func listMembers(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let page = try await client.groups.listMembers(
    groupType: groupType,
    groupId: groupId,
    options: PaginationOptions(limit: 50)
  )
  let members = page["items"] as? [[String: Any]] ?? []
  for member in members {
    print(member["userId"] ?? "", member["userName"] ?? "")
  }
  let nextCursor = page["cursor"] as? String
  // #endregion example
  _ = nextCursor
}
