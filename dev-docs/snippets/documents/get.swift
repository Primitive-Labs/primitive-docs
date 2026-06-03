import JsBaoClient

// Fetch a document's metadata from the server. Swift returns an untyped
// `[String: Any]` (note: the wire field is `modifiedAt`, not `lastModified`).
func get(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let info = try await client.documents.get(documentId: documentId)
  let title = info["title"] as? String
  // #endregion example
  _ = title
}
