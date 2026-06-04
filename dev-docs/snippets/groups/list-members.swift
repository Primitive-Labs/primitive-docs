import JsBaoClient

// List members of a group, with optional pagination. Returns a typed
// `PaginatedResult<GroupMemberInfo>`.
func listMembers(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let page = try await client.groups.listMembers(
    groupType: groupType,
    groupId: groupId,
    options: PaginationOptions(limit: 50)
  )
  for member in page.items {
    print(member.userId, member.userName ?? "", member.userEmail ?? "")
  }
  let nextCursor = page.cursor
  // #endregion example
  _ = nextCursor
}
