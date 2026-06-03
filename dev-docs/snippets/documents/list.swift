import JsBaoClient

// List documents accessible to the current user as a typed `[DocumentInfo]`.
// (Deprecated — prefer `client.me.ownedDocuments()` / `sharedDocuments()`.)
func list(client: JsBaoClient) async throws {
  // #region example
  let items = try await client.documents.list(
    options: PaginationOptions(limit: 50)
  )
  let firstTitle = items.first?.title
  // #endregion example
  _ = firstTitle
}
