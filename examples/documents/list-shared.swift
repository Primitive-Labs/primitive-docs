import JsBaoClient

// Documents shared directly with the current user (non-owner permission
// grants + pending invitations). Group-/collection-shared docs are NOT here —
// list those through the group or collection.
func listSharedDocuments(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.me.sharedDocuments(limit: 50, tag: "channel")

  for share in page.items {
    // Each row nests the base document fields (title, createdAt, …) under
    // `.document`, alongside the share extras (grantedBy, source, invitationId).
    print(share.document.title, share.document.permission, share.grantedBy)
  }

  // `cursor` is a raw-JSON pagination cursor — pass it back for the next page.
  if let cursor = page.cursor {
    _ = try await client.me.sharedDocuments(cursor: cursor)
  }
  // #endregion example
}
