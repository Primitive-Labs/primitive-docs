import JsBaoClient

// Update a group's name and/or description.
func update(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let group = try await client.groups.update(
    groupType: groupType,
    groupId: groupId,
    params: ["name": "Design Guild", "description": "Renamed crew"]
  )
  // #endregion example
  _ = group
}
