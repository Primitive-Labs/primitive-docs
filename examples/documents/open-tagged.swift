import JsBaoClient

// Open every document with a given tag, then query across all of them.
func openTagged(client: JsBaoClient) async throws {
  // #region example
  // Open every document with a given tag
  let channels = try await client.me.ownedDocuments(tag: "channel")
  for channel in channels {
    _ = try await client.documents.open(channel.documentId)
  }

  // Queries run across all open documents by default
  let messages = Message.query()
  // #endregion example
  _ = messages
}
