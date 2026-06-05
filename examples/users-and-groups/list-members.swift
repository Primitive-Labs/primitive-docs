import JsBaoClient

// List a group's members, paginated. Each row carries the member's id and
// (when known) name/email plus who added them and when.
func listGroupMembers(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.groups.listMembers(groupType: "team", groupId: "engineering")
  // page.items: [GroupMemberInfo(userId, userName?, userEmail?, addedAt, addedBy)]

  let next = try await client.groups.listMembers(
    groupType: "team", groupId: "engineering",
    options: PaginationOptions(limit: 50, cursor: page.cursor)
  )
  // #endregion example
  _ = (page, next)
}
