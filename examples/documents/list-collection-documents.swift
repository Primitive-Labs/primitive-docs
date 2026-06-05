import JsBaoClient

// Documents the user can access via a collection they're a member of.
func listCollectionDocuments(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let page = try await client.collections.listDocuments(
    collectionId: collectionId,
    options: PaginationOptions(limit: 50)
  )
  let items = page.items
  // #endregion example
  _ = items
}
