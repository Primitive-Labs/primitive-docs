import JsBaoClient

func deleteX(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Returns a typed BlobDeleteResult ({ deleted }).
  let result = try await blobs.delete(blobId: blobId)
  let deleted = result.deleted
  // #endregion example
  _ = deleted
}
