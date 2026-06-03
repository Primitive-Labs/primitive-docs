import JsBaoClient

// Open a document for editing. Swift returns a `YDocument` directly and takes
// a typed `OpenDocumentOptions`.
func open(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let doc = try await client.documents.open(
    documentId,
    options: OpenDocumentOptions(waitForLoad: .localIfAvailableElseNetwork)
  )
  // #endregion example
  _ = doc
}
