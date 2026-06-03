import JsBaoClient

// List collections that contain a specific document. Swift returns an untyped
// `[String: Any]` envelope.
func listCollectionsForDocument(
  client: JsBaoClient,
  documentId: String
) async throws {
  // #region example
  let result = try await client.collections.listCollectionsForDocument(
    documentId: documentId,
    options: PaginationOptions(limit: 50)
  )
  let items = result["items"] as? [[String: Any]] ?? []
  // #endregion example
  _ = items
}
