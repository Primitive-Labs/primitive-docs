import JsBaoClient

// List documents shared with the current user. Swift returns a typed
// `SharedDocumentListResult` (`{ items, cursor? }`). Each `SharedDocument`
// carries the base document under `.document` plus shared extras (`grantedBy`,
// `source`, `invitationId`).
func sharedDocuments(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.me.sharedDocuments(limit: 50, tag: "shared")
  let items = result.items
  let cursor = result.cursor
  for shared in items {
    print(shared.document.documentId, shared.grantedBy)
  }
  // #endregion example
  _ = (items, cursor)
}
