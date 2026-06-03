import JsBaoClient

// Add a member to a collection by user id or by email. Adding a member grants
// access to every document in the collection (current and future). The email
// form defers the grant until signup.
func addCollectionMember(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  // Existing user
  _ = try await client.collections.addMember(
    collectionId: collectionId,
    params: ["userId": "u-1234", "permission": "read-write"]  // "reader" | "read-write"
  )

  // By email — deferred grant resolves on signup
  let result = try await client.collections.addMember(
    collectionId: collectionId,
    params: [
      "email": "newhire@example.com",
      "permission": "reader",
      "sendEmail": true,                  // optional: platform sends an invite email
      "collectionUrl": "https://...",     // required when sendEmail is true
      "note": "Sharing the onboarding docs",
    ]
  )
  // result.status: "added" | "already_member" | "pending_signup"
  // #endregion example
  _ = result
}
