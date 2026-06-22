import JsBaoClient

// Inspect pending deferred grants for an email (admin/debug only). End-user
// "people with access + pending" UI uses the per-resource endpoints instead.
func inspectDeferredGrants(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.invitations.listDeferredGrants(
    email: "alice@example.com"
  )
  let grants = result.grants
  let nextCursor = result.nextCursor
  // #endregion example
  _ = (grants, nextCursor)
}
