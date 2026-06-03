import JsBaoClient

// Add a tag to a document. Returns the updated tag list as `[String]`.
func addTag(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let tags = try await client.documents.addTag(documentId: documentId, tag: "archived")
  // #endregion example
  _ = tags
}
