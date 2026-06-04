import JsBaoClient

// Add a user to a group by userId OR email. Build params with the
// `.userId(_:)` / `.email(_:)` factories. The result is a discriminated
// union: switch over `.direct` / `.deferred`.
func addMember(client: JsBaoClient, groupType: String, groupId: String, email: String) async throws {
  // #region example
  let result = try await client.groups.addMember(
    groupType: groupType,
    groupId: groupId,
    params: .email(email)
  )
  switch result {
  case let .deferred(add):
    // Email has no app user yet — a deferred add was created.
    print("Invitation pending:", add.deferredId, add.inviteToken ?? "")
  case let .direct(add):
    // status == "added" or "already_member"
    print(add.status, add.userId, add.addedAt)
  }
  // #endregion example
  _ = result
}
