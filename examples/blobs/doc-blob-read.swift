import JsBaoClient

// List a document's blobs, get an authenticated URL, and read bytes.
func readDocumentBlobs(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)

  let list = try await blobs.list()
  let url = blobs.downloadUrl(blobId: blobId)          // synchronous, authenticated
  let bytes = try await blobs.read(blobId: blobId)
  // #endregion example
  _ = (list, url, bytes)
}
