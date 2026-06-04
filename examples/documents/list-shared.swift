import JsBaoClient

// Documents shared directly with the current user (non-owner permission
// grants + pending invitations). Group-/collection-shared docs are NOT here —
// list those through the group or collection.
func listSharedDocuments(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.me.sharedDocuments(limit: 50, tag: "channel")
  let items = page["items"] as? [[String: Any]] ?? []

  for doc in items {
    // Each row carries the base document fields (title, createdAt, …) plus the
    // share extras (permission, source, grantedBy, invitationId).
    print(doc["title"] ?? "", doc["permission"] ?? "", doc["grantedBy"] ?? "")
  }

  // `cursor` is a raw-JSON pagination cursor — pass it back for the next page.
  if let cursor = page["cursor"] as? String {
    _ = try await client.me.sharedDocuments(cursor: cursor)
  }
  // #endregion example
}
