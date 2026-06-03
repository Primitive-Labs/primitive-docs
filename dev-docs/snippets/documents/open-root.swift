import JsBaoClient

// Open the app's shared root document. Swift returns a `YDocument` and accepts
// the same typed `OpenDocumentOptions`.
func openRoot(client: JsBaoClient) async throws {
  // #region example
  let doc = try await client.documents.openRoot()
  // #endregion example
  _ = doc
}
