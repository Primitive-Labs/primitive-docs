import JsBaoClient

// Collections accept email-based members exactly like documents and groups —
// a deferred grant that resolves on signup.
func addCollectionMembers(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  // Add an individual member by userId
  _ = try await client.collections.addMember(
    collectionId: collectionId,
    params: .user("user-abc", permission: .readWrite)
  )

  // Or by email — deferred grant resolves on signup
  let result = try await client.collections.addMember(
    collectionId: collectionId,
    params: .email(
      "newhire@example.com",
      permission: .reader,
      sendEmail: true, // optional: platform sends an invite email
      collectionUrl: "https://app.example.com/onboarding", // required when sendEmail is true
      note: "Sharing the onboarding docs"
    )
  )
  // result is .direct (added / already_member) or .deferred —
  // the deferred case carries invitationId / inviteToken / expiresAt.
  // #endregion example
  _ = result
}
