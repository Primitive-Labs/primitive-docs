import JsBaoClient

// Revoke a deferred grant. `type` (.document | .group) is required because
// document and group deferred grants live in separate tables. Returns a typed
// `{ status, deferredId }` result.
func revokeDeferredGrant(client: JsBaoClient, deferredId: String) async throws {
  // #region example
  let result = try await client.invitations.revokeDeferredGrant(
    deferredId: deferredId, type: .document
  )
  let status = result.status
  // #endregion example
  _ = status
}
