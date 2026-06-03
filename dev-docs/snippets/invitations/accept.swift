import JsBaoClient

// Accept an invitation via its invite token. Marks the invitation accepted
// (write-once) and resolves any linked deferred grants to the caller. Swift
// returns an untyped `[String: Any]`, dropping JS's typed `AcceptInviteResult` —
// the nested `grantsResolved` counts are read via dictionary casts.
func accept(client: JsBaoClient, inviteToken: String) async throws {
  // #region example
  let result = try await client.invitations.accept(inviteToken: inviteToken)
  let grantsResolved = result["grantsResolved"] as? [String: Any] ?? [:]
  let groupsResolved = grantsResolved["groups"] as? Int ?? 0
  let documentsResolved = grantsResolved["documents"] as? Int ?? 0
  // #endregion example
  _ = (groupsResolved, documentsResolved)
}
