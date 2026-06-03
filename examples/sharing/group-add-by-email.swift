import JsBaoClient

// Add a member to a group by email. The result carries a `status`
// ("added" | "already_member" | "pending_signup").
func addGroupMemberByEmail(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.groups.addMember(
    groupType: "team",
    groupId: "engineering",
    params: ["email": "alice@example.com"]
  )
  // #endregion example
  _ = result
}
