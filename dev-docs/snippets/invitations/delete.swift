import JsBaoClient

// Delete an app-level invitation (admin/owner only). Swift returns the
// `{ success, message }` result as an untyped `[String: Any]`.
func deleteInvitation(client: JsBaoClient, invitationId: String) async throws {
  // #region example
  let result = try await client.invitations.delete(invitationId: invitationId)
  let success = result["success"] as? Bool ?? false
  // #endregion example
  _ = success
}
