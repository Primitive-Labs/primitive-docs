import JsBaoClient

// Create, list, get, update, and delete groups. A group is identified by a
// (groupType, groupId) pair.
func manageGroups(client: JsBaoClient) async throws {
  // #region example
  // Create. If the group type has autoAddCreator (default), the creator is
  // added as a member.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "team",
    groupId: "engineering",
    name: "Engineering Team",
    description: "Platform engineering team"  // optional
  ))

  // List — returns { items, cursor }. Filter by type and page through.
  let page1 = try await client.groups.list(options: ListGroupsOptions(type: "team", limit: 10))
  let page2 = try await client.groups.list(
    options: ListGroupsOptions(type: "team", limit: 10, cursor: page1.cursor)
  )

  // Get a single group.
  let group = try await client.groups.get(groupType: "team", groupId: "engineering")

  // Update name and/or description (both optional).
  _ = try await client.groups.update(
    groupType: "team", groupId: "engineering",
    params: UpdateGroupParams(name: "Platform Engineering", description: "Owns the platform stack")
  )

  // Cascade-deletes all memberships and group permissions.
  _ = try await client.groups.delete(groupType: "team", groupId: "engineering")
  // #endregion example
  _ = (page1, page2, group)
}
