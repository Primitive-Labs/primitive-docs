import JsBaoClient

// Open every document carrying a given tag, then query across them. Queries
// span all open documents by default, so once each tagged doc is open the
// query sees them together.
func openTaggedDocuments(client: JsBaoClient) async throws {
  // #region example
  // Open every document with a given tag
  let channels = try await client.me.ownedDocuments(tag: "channel")
  for channel in channels {
    _ = try await client.documents.open(channel.documentId)
  }

  // Query runs across all open documents by default
  let messages = Message.query([:])
  // #endregion example
  _ = messages
}
