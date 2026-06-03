import JsBaoClient

// List pending access requests for a document (owner/admin only). Swift
// returns an untyped `[[String: Any]]`.
func listAccessRequests(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let requests = try await client.documents.listAccessRequests(
    documentId: documentId
  )
  // #endregion example
  _ = requests
}
