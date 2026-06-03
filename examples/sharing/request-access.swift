import JsBaoClient

// Access-request flow: a user with a link requests access; an owner reviews.
func accessRequests(
  client: JsBaoClient,
  documentId: String,
  requestId: String
) async throws {
  // #region example
  // A user with the link requests access
  _ = try await client.documents.requestAccess(
    documentId: documentId,
    params: ["permission": "read-write", "message": "Please add me to this doc"]
  )

  // An owner lists pending requests and approves one
  let requests = try await client.documents.listAccessRequests(documentId: documentId)
  _ = try await client.documents.approveAccessRequest(documentId: documentId, requestId: requestId)
  // #endregion example
  _ = requests
}
