import JsBaoClient

// Approve a pending access request (owner/admin only) with typed
// `ApproveAccessRequestOptions`. Returns an `AccessRequestResult`.
func approveAccessRequest(
  client: JsBaoClient, documentId: String, requestId: String
) async throws {
  // #region example
  let result = try await client.documents.approveAccessRequest(
    documentId: documentId,
    requestId: requestId,
    options: ApproveAccessRequestOptions(permission: .reader)
  )
  // #endregion example
  _ = result.success
}
