import JsBaoClient

// Request access to a document you don't currently have permission on. Swift
// takes an untyped params dict and returns an untyped `[String: Any]`.
func requestAccess(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.requestAccess(
    documentId: documentId,
    params: [
      "permission": "read-write",
      "message": "Need this for the launch review",
    ]
  )
  // #endregion example
  _ = result
}
