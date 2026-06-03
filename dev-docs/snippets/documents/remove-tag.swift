import JsBaoClient

// Remove a tag from a document. Returns the updated tag list as `[String]`.
func removeTag(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let tags = try await client.documents.removeTag(documentId: documentId, tag: "archived")
  // #endregion example
  _ = tags
}
