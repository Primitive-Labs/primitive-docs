import JsBaoClient

// Fetch metadata for the app's shared root document as a typed `DocumentInfo`.
func getRoot(client: JsBaoClient) async throws {
  // #region example
  let info = try await client.documents.getRoot()
  let rootId = info.documentId
  // #endregion example
  _ = rootId
}
