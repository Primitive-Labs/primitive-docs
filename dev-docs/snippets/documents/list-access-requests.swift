import JsBaoClient

// List pending access requests for a document (owner/admin only) as typed
// `[DocumentAccessRequest]`.
func listAccessRequests(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let requests = try await client.documents.listAccessRequests(
    documentId: documentId
  )
  let firstRequester = requests.first?.requesterId
  // #endregion example
  _ = firstRequester
}
