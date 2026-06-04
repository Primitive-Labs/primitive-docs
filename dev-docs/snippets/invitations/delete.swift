import JsBaoClient

// Delete an app-level invitation (admin/owner only). Also cascade-deletes any
// linked deferred grants. Returns a typed `{ success, message }` result.
func deleteInvitation(client: JsBaoClient, invitationId: String) async throws {
  // #region example
  let result = try await client.invitations.delete(invitationId: invitationId)
  let success = result.success
  // #endregion example
  _ = success
}
