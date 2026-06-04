import JsBaoClient

// List pending deferred grants (admin/owner only) — permissions/memberships
// created for users who haven't signed up yet. Returns a typed
// `{ grants, nextCursor }` page; each grant is a `DeferredGrant` union
// discriminated on `type` (.document | .group).
func listDeferredGrants(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.invitations.listDeferredGrants(
    type: .document, limit: 25
  )
  for grant in result.grants {
    if case let .document(doc) = grant {
      print(doc.documentId, doc.permission)
    }
  }
  let nextCursor = result.nextCursor
  // #endregion example
  _ = nextCursor
}
