import JsBaoClient

// Revoke a deferred grant. `type` ("document" | "group") is required because
// document and group deferred grants live in separate tables. Swift returns
// the `{ status, deferredId }` result as an untyped `[String: Any]`.
func revokeDeferredGrant(client: JsBaoClient, deferredId: String) async throws {
  // #region example
  let result = try await client.invitations.revokeDeferredGrant(
    deferredId: deferredId, type: "document"
  )
  let status = result["status"] as? String ?? ""
  // #endregion example
  _ = status
}
