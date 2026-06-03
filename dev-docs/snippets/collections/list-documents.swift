import JsBaoClient

// List documents in a collection. Swift returns an untyped `[String: Any]`
// envelope; dig out `items` with a dict cast.
func listDocuments(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let result = try await client.collections.listDocuments(
    collectionId: collectionId,
    options: PaginationOptions(limit: 50)
  )
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
