import JsBaoClient

// Documents the user owns (created them, or had ownership transferred to them).
func listOwnedDocuments(client: JsBaoClient) async throws {
  // #region example
  // The unified { items, cursor } envelope as [String: Any] — same shape as
  // sharedDocuments(tag:).
  let page = try await client.me.ownedDocuments(tag: "channel")
  let items = page["items"] as? [[String: Any]] ?? []
  let cursor = page["cursor"] as? String
  // #endregion example
  _ = (items, cursor)
}
