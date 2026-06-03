import JsBaoClient

// Fetch a document's metadata from the server as a typed `DocumentInfo`.
func get(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let info = try await client.documents.get(documentId: documentId)
  let title = info.title
  let lastModified = info.lastModified
  // #endregion example
  _ = (title, lastModified)
}
