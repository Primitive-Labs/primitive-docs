import JsBaoClient

func list(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Swift returns an untyped [[String: Any]] (no cursor / pagination).
  let items = try await blobs.list(limit: 50)
  let firstBlobId = items.first?["blobId"] as? String
  // #endregion example
  _ = (items, firstBlobId)
}
