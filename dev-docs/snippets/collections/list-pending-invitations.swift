import JsBaoClient

// List pending (deferred, non-expired) invitations for a collection.
func listPendingInvitations(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  let pending = try await client.collections.listPendingInvitations(
    collectionId: collectionId
  )
  for invite in pending {
    print(invite.email, invite.permission, invite.expiresAt)
  }
  // #endregion example
  _ = pending
}
