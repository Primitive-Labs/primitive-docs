import JsBaoClient

// The "my documents" surface: what the user owns and what's been shared with
// them. Group-/collection-shared docs are NOT included here.
func listMyDocuments(client: JsBaoClient) async throws {
  // #region example
  // Documents the user owns (created them, or ownership was transferred).
  let owned = try await client.me.ownedDocuments()

  // Documents shared directly with the user. Returns a { items, cursor }
  // envelope; each row carries the base document fields plus the share extras
  // (permission, source, grantedBy, invitationId).
  let shared = try await client.me.sharedDocuments()
  let items = shared["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = (owned, items)
}
