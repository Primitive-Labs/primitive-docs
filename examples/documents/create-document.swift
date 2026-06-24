import JsBaoClient

// Create a new (non-singleton) document with tags. `create()` is local-first:
// it returns the new document's metadata, and the document is already open,
// writable, and connected to the model facade — no explicit open is needed.
func createWorkspace(client: JsBaoClient) async throws -> String? {
  // #region example
  let result = try await client.documents.create(
    options: CreateDocumentOptions(title: "New Project", tags: ["workspace"])
  )
  // The generated id lives inside the returned metadata.
  let documentId = result.metadata?["documentId"]?.stringValue
  // The new document is already open — query or save into it right away.
  // #endregion example
  return documentId
}
