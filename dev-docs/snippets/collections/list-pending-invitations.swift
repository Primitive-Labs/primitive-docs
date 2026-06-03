import JsBaoClient

// List pending (deferred, non-expired) invitations for a collection. Swift
// returns an untyped `[[String: Any]]` array.
func listPendingInvitations(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  let pending = try await client.collections.listPendingInvitations(
    collectionId: collectionId
  )
  for invite in pending {
    let email = invite["email"] as? String
    _ = email
  }
  // #endregion example
  _ = pending
}
