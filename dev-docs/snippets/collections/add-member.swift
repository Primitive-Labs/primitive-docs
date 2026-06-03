import JsBaoClient

// Add a member by userId or email. Swift returns a FLAT untyped `[String: Any]`
// rather than JS's `CollectionAddMemberResult` discriminated union — branch on
// the `status` key yourself.
func addMember(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let result = try await client.collections.addMember(
    collectionId: collectionId,
    params: [
      "email": "teammate@example.com",
      "permission": "read-write",
      "sendEmail": true,
    ]
  )

  let status = result["status"] as? String
  if status == "pending_signup" {
    // Email not yet an app user — a deferred invite was created.
    let inviteToken = result["inviteToken"] as? String
    _ = inviteToken
  } else {
    // "added" or "already_member" — a real membership exists.
    let userId = result["userId"] as? String
    _ = userId
  }
  // #endregion example
  _ = result
}
