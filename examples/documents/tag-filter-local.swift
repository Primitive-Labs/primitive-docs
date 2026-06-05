import JsBaoClient

// Create a tagged document, then filter the owned list locally by tag.
func tagFilterLocal(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.create(
    options: CreateDocumentOptions(title: "My List", tags: ["todolist"])
  )

  // Filter locally
  let owned = try await client.me.ownedDocuments()
  let todoLists = owned.filter { $0.tags?.contains("todolist") == true }
  // #endregion example
  _ = (result, todoLists)
}
