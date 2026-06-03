import JsBaoClient

// Delete a group by its type and ID. Swift returns an untyped `[String: Any]`
// (JS returns a typed `{ success: Bool }`).
func deleteGroup(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let result = try await client.groups.delete(groupType: groupType, groupId: groupId)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
