import JsBaoClient

// Create a new (non-singleton) document with tags, then open it so it can be
// queried and written to. `create()` returns the new document's metadata as a
// [String: Any] dict.
func createWorkspace(client: JsBaoClient) async throws -> String? {
  // #region example
  let result = try await client.documents.create(
    options: ["title": "New Project", "tags": ["workspace"]]
  )
  let metadata = result["metadata"] as? [String: Any]
  let documentId = metadata?["documentId"] as? String
  if let documentId {
    _ = try await client.documents.open(documentId)
  }
  // #endregion example
  return documentId
}
