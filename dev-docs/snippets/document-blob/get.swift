import JsBaoClient

func get(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Returns a typed BlobInfo.
  let meta = try await blobs.get(blobId: blobId)
  let contentType = meta.contentType
  // #endregion example
  _ = (meta, contentType)
}
