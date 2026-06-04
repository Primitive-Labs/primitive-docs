import JsBaoClient

// List collections that contain a specific document.
func listCollectionsForDocument(
  client: JsBaoClient,
  documentId: String
) async throws {
  // #region example
  let page = try await client.collections.listCollectionsForDocument(
    documentId: documentId,
    options: PaginationOptions(limit: 50)
  )
  // #endregion example
  _ = page.items
}
