import JsBaoClient

// Model nested organizational structure with multiple group types — org,
// department, and team. A user can belong to groups at several levels at once,
// and CEL can check any level: isMemberOf('org', ...), isMemberOf('dept', ...),
// isMemberOf('team', ...).
func setUpOrgHierarchy(client: JsBaoClient, userId: String) async throws {
  // #region example
  // Organization-level group.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "org", groupId: "acme-corp", name: "Acme Corp"))

  // Department-level groups.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "dept", groupId: "engineering", name: "Engineering"))
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "dept", groupId: "marketing", name: "Marketing"))

  // Team-level group.
  _ = try await client.groups.create(params: CreateGroupParams(
    groupType: "team", groupId: "backend", name: "Backend Team"))

  // A user can be in multiple groups at different levels.
  _ = try await client.groups.addMember(
    groupType: "org", groupId: "acme-corp", params: .userId(userId))
  _ = try await client.groups.addMember(
    groupType: "dept", groupId: "engineering", params: .userId(userId))
  _ = try await client.groups.addMember(
    groupType: "team", groupId: "backend", params: .userId(userId))
  // #endregion example
}
