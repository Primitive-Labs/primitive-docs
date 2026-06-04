import JsBaoClient

// Categorize documents with tags, then add/remove tags on an existing
// document. Filter the user's owned documents server-side by tag.
func tagDocuments(client: JsBaoClient, documentId: String) async throws {
  // #region example
  // Filter the user's owned documents by tag
  let todoLists = try await client.me.ownedDocuments(tag: "todolist")

  // Add a tag to an existing document
  _ = try await client.documents.addTag(documentId: documentId, tag: "archived")

  // Remove a tag from a document
  _ = try await client.documents.removeTag(documentId: documentId, tag: "archived")
  // #endregion example
  _ = todoLists
}
