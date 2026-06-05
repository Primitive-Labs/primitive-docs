import JsBaoClient

// Open the app's shared root document. Swift returns an `OpenDocumentResult`
// (`doc`, `metadata`) and accepts the same typed `OpenDocumentOptions`.
func openRoot(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.openRoot()
  let doc = result.doc
  // #endregion example
  _ = doc
}
