import JsBaoClient

// Add a member by userId or email (mutually exclusive). Returns the
// `CollectionAddMemberResult` discriminated union — switch on the case.
func addMember(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let result = try await client.collections.addMember(
    collectionId: collectionId,
    params: .email("teammate@example.com", permission: .readWrite, sendEmail: true)
  )

  switch result {
  case let .deferred(add):
    // Email not yet an app user — a deferred invite was created.
    print(add.invitationId, add.inviteToken as Any)
  case let .direct(add):
    // "added" or "already_member" — a real membership exists.
    print(add.userId, add.permission)
  }
  // #endregion example
  _ = result
}
