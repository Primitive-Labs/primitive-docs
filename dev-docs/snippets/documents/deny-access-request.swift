import JsBaoClient

// Deny a pending access request (owner/admin only). Returns a typed
// `AccessRequestResult`.
func denyAccessRequest(
  client: JsBaoClient, documentId: String, requestId: String
) async throws {
  // #region example
  let result = try await client.documents.denyAccessRequest(
    documentId: documentId, requestId: requestId
  )
  // #endregion example
  _ = result.success
}
