import JsBaoClient

// A typical "invite a teammate and share a project with them" flow. When the
// new user signs up, all three pending actions apply atomically.
func inviteAndShare(client: JsBaoClient, projectDocId: String) async throws {
  // #region example
  // 1. Member (quota-checked) invites a teammate
  let quota = try await client.invitations.quota()
  let unlimited = quota["unlimited"] as? Bool ?? false
  let remaining = quota["remaining"] as? Int ?? 0
  if !unlimited && remaining <= 0 { return }  // showUpgradePrompt()

  _ = try await client.invitations.create(params: [
    "email": "newhire@example.com",
    "role": "member",
  ])

  // 2. Share the project document with them (pending until signup)
  _ = try await client.documents.updatePermissions(
    documentId: projectDocId,
    params: ["email": "newhire@example.com", "permission": "read-write"]
  )

  // 3. Also add them to the engineering group (pending until signup)
  _ = try await client.groups.addMember(
    groupType: "team",
    groupId: "engineering",
    params: ["email": "newhire@example.com"]
  )
  // #endregion example
}
