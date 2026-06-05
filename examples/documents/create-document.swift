import JsBaoClient

// Create a new (non-singleton) document with tags, then open it so it can be
// queried and written to. `create()` returns the new document's metadata.
func createWorkspace(client: JsBaoClient) async throws -> String? {
  // #region example
  let result = try await client.documents.create(
    options: CreateDocumentOptions(title: "New Project", tags: ["workspace"])
  )
  let documentId = result.metadata?["documentId"]?.stringValue
  if let documentId {
    _ = try await client.documents.open(documentId)
  }
  // #endregion example
  return documentId
}
