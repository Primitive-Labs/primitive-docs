import JsBaoClient

// Remove a member by userId. (To remove by email, Swift exposes a separate
// `removeMemberByEmail` method — see below.) Swift returns untyped `[String: Any]`.
func removeMember(client: JsBaoClient, groupType: String, groupId: String, userId: String) async throws {
  // #region example
  let result = try await client.groups.removeMember(
    groupType: groupType,
    groupId: groupId,
    userId: userId
  )
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
