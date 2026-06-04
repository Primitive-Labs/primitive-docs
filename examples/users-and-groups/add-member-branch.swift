import JsBaoClient

// addMember returns a dictionary — branch on the "status" key. An email that
// isn't yet an app user produces a deferred add, not a direct membership.
func addMemberWithBranching(client: JsBaoClient, email: String) async throws {
  // #region example
  let result = try await client.groups.addMember(
    groupType: "team", groupId: "engineering",
    params: ["email": email]
  )

  switch result["status"] as? String {
  case "added":
    // New membership: ["userId", "userName"?, "userEmail"?, "addedAt", "addedBy"]
    print("added", result["userId"] as? String ?? "")
  case "already_member":
    // Idempotent no-op (replaces the old HTTP 409).
    print("already a member")
  case "pending_signup":
    // Email isn't an app user yet. The server created an AppInvitation +
    // DeferredGroupAdd: ["email", "appInvitationCreated", "deferredId",
    // "expiresAt", "groupType", "groupId", "invitationId", "inviteToken"].
    // Use inviteToken to build an accept URL; cancel via revokeDeferredGrant.
    if let deferredId = result["deferredId"] as? String {
      _ = try await client.invitations.revokeDeferredGrant(deferredId: deferredId, type: "group")
    }
  default:
    break
  }
  // #endregion example
}
