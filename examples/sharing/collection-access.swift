import JsBaoClient

// A collection's members + pending invites in one call.
func collectionAccess(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let access = try await client.collections.getAccess(collectionId: collectionId)

  // Or fetch just the pending (not-yet-signed-up) invitations:
  let pending = try await client.collections.listPendingInvitations(collectionId: collectionId)
  // #endregion example
  _ = (access, pending)
}
