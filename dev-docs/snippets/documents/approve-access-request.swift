import JsBaoClient

// Approve a pending access request (owner/admin only). Swift takes an untyped
// params dict and returns an untyped `[String: Any]`.
func approveAccessRequest(
  client: JsBaoClient, documentId: String, requestId: String
) async throws {
  // #region example
  let result = try await client.documents.approveAccessRequest(
    documentId: documentId,
    requestId: requestId,
    params: ["permission": "reader"]
  )
  // #endregion example
  _ = result
}
