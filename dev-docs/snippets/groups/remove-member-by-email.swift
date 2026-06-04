import JsBaoClient

// Swift-only convenience: remove a member by email. In JS this is the same
// `removeMember` method called with `{ email }`. Returns `{ success: Bool }`.
func removeMemberByEmail(client: JsBaoClient, groupType: String, groupId: String, email: String) async throws {
  // #region example
  let result = try await client.groups.removeMemberByEmail(
    groupType: groupType,
    groupId: groupId,
    email: email
  )
  let success = result.success
  // #endregion example
  _ = success
}
