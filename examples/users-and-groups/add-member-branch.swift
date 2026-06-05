import JsBaoClient

// addMember returns a discriminated union — branch on its case. An email that
// isn't yet an app user produces a deferred add, not a direct membership.
func addMemberWithBranching(client: JsBaoClient, email: String) async throws {
  // #region example
  let result = try await client.groups.addMember(
    groupType: "team", groupId: "engineering",
    params: .email(email)
  )

  switch result {
  case let .direct(add) where add.status == "added":
    // New membership: userId, userName?, userEmail?, addedAt, addedBy
    print("added", add.userId)
  case .direct:
    // status == "already_member": idempotent no-op (replaces the old HTTP 409).
    print("already a member")
  case let .deferred(deferred):
    // Email isn't an app user yet. The server created an AppInvitation +
    // DeferredGroupAdd: email, appInvitationCreated, deferredId, expiresAt,
    // groupType, groupId, invitationId, inviteToken. Use inviteToken to build
    // an accept URL; cancel via revokeDeferredGrant.
    _ = try await client.invitations.revokeDeferredGrant(
      deferredId: deferred.deferredId, type: .group
    )
  }
  // #endregion example
}
