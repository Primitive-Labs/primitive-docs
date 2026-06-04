import JsBaoClient

// Delete a group by its type and ID. Returns a typed `{ success: Bool }`.
func deleteGroup(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let result = try await client.groups.delete(groupType: groupType, groupId: groupId)
  let success = result.success
  // #endregion example
  _ = success
}
