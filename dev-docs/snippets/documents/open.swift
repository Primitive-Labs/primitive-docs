import JsBaoClient

// Open a document for editing. Swift returns an `OpenDocumentResult`
// (`doc`, `metadata`) and takes a typed `OpenDocumentOptions`.
func open(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.open(
    documentId,
    options: OpenDocumentOptions(waitForLoad: .localIfAvailableElseNetwork)
  )
  let doc = result.doc
  // #endregion example
  _ = doc
}
