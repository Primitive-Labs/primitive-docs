import JsBaoClient

func get(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Swift returns an untyped [String: Any].
  let meta = try await blobs.get(blobId: blobId)
  let contentType = meta["contentType"] as? String
  // #endregion example
  _ = (meta, contentType)
}
