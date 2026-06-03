import JsBaoClient

// Request access to a document you don't currently have permission on, with
// typed `RequestAccessOptions`. Returns a `DocumentAccessRequestResponse`.
func requestAccess(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.requestAccess(
    documentId: documentId,
    options: RequestAccessOptions(
      permission: .readWrite,
      message: "Need this for the launch review"
    )
  )
  // #endregion example
  _ = result.request.requestId
}
