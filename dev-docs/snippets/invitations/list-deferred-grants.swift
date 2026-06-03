import JsBaoClient

// List pending deferred grants (admin/owner only) — permissions/memberships
// created for users who haven't signed up yet. Swift takes flat args and
// returns an untyped `[String: Any]`, dropping JS's typed `DeferredGrant`
// union, so each grant is inspected via dictionary casts on `type`.
func listDeferredGrants(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.invitations.listDeferredGrants(
    type: "document", limit: 25
  )
  let grants = result["grants"] as? [[String: Any]] ?? []
  for grant in grants where grant["type"] as? String == "document" {
    let documentId = grant["documentId"] as? String ?? ""
    let permission = grant["permission"] as? String ?? ""
    print(documentId, permission)
  }
  let nextCursor = result["nextCursor"] as? String
  // #endregion example
  _ = nextCursor
}
