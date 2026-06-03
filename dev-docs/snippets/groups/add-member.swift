import JsBaoClient

// Add a user to a group by userId OR email. Swift takes an untyped
// `[String: Any]` (the userId-XOR-email contract is not compiler-enforced) and
// returns an untyped `[String: Any]` — hand-parse the `status` discriminator.
func addMember(client: JsBaoClient, groupType: String, groupId: String, email: String) async throws {
  // #region example
  let result = try await client.groups.addMember(
    groupType: groupType,
    groupId: groupId,
    params: ["email": email]
  )
  let status = result["status"] as? String ?? ""
  if status == "pending_signup" {
    // Email has no app user yet — a deferred add was created.
    print("Invitation pending:", result["deferredId"] ?? "", result["inviteToken"] ?? "")
  } else {
    // "added" or "already_member"
    print(status, result["userId"] ?? "", result["addedAt"] ?? "")
  }
  // #endregion example
  _ = result
}
