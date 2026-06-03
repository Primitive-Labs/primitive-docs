import JsBaoClient

// List every group a user belongs to. The Swift client has no `groupType`
// filter parameter (#960) — it returns all memberships, so filter client-side.
func listUserMemberships(client: JsBaoClient, userId: String) async throws {
  // #region example
  let all = try await client.groups.listUserMemberships(userId: userId)
  let teams = all.filter { ($0["groupType"] as? String) == "team" }
  for m in teams {
    print(m["groupType"] ?? "", m["groupId"] ?? "", m["name"] ?? "")
  }
  // #endregion example
  _ = teams
}
