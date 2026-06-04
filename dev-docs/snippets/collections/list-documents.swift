import JsBaoClient

// List documents in a collection, each with the caller's effective permission.
func listDocuments(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let page = try await client.collections.listDocuments(
    collectionId: collectionId,
    options: PaginationOptions(limit: 50)
  )
  for doc in page.items {
    print(doc.title, doc.permission)
  }
  // #endregion example
  _ = page.cursor
}
