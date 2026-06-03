import JsBaoClient

// Deny a pending document access request. Owner/admin only. The optional
// `documentUrl` is included in the requester's notification email.
func denyAccessRequest(
  client: JsBaoClient,
  documentId: String,
  requestId: String
) async throws {
  // #region example
  _ = try await client.documents.denyAccessRequest(
    documentId: documentId,
    requestId: requestId,
    params: ["documentUrl": "https://myapp.example/docs/\(documentId)"]
  )
  // #endregion example
}
