import JsBaoClient

// The two halves of "documents the user has direct access to", plus the
// pending-invitation inbox view.
func myDocuments(client: JsBaoClient) async throws {
  // #region example
  // Documents the user owns (created, or had ownership transferred to).
  let owned = try await client.me.ownedDocuments(limit: 50, tag: "draft")

  // Documents shared directly with the user (non-owner permission rows +
  // pending invitations). Group/collection shares do NOT appear here.
  let shared = try await client.me.sharedDocuments(limit: 50, tag: "shared")
  let items = shared.items
  let cursor = shared.cursor

  // Document invitations the user can accept — an inbox view.
  let pending = try await client.me.pendingDocumentInvitations()
  // #endregion example
  _ = (owned, items, cursor, pending)
}
