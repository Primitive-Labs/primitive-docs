import JsBaoClient

// Accept an invitation via its invite token. Marks the invitation accepted
// (write-once) and resolves any linked deferred grants to the caller. Returns a
// typed `AcceptInviteResult` including how many grants resolved.
func accept(client: JsBaoClient, inviteToken: String) async throws {
  // #region example
  let result = try await client.invitations.accept(inviteToken: inviteToken)
  let groupsResolved = result.grantsResolved.groups
  let documentsResolved = result.grantsResolved.documents
  // #endregion example
  _ = (groupsResolved, documentsResolved)
}
