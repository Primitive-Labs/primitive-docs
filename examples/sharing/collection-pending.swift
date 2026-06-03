import JsBaoClient

// Pending (not-yet-resolved) email invitations attached to a collection.
func collectionPendingInvitations(
  client: JsBaoClient,
  collectionId: String
) async throws {
  // #region example
  let pending = try await client.collections.listPendingInvitations(collectionId: collectionId)
  // [{ email, permission, invitationId, ... }]
  // #endregion example
  _ = pending
}
