import JsBaoClient

// Create a new group. `groupType`, `groupId`, and `name` are required.
func create(client: JsBaoClient) async throws {
  // #region example
  let group = try await client.groups.create(params: CreateGroupParams(
    groupType: "team",
    groupId: "design",
    name: "Design Team",
    description: "Product design crew"
  ))
  // #endregion example
  _ = group
}
