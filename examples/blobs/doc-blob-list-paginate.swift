import JsBaoClient

// Page through a document's blobs by following the opaque `cursor`. The cursor
// is only present when more results exist.
func paginateDocumentBlobs(
  client: JsBaoClient,
  documentId: String
) async throws {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  let page1 = try await blobs.list(limit: 50)
  for b in page1.items {
    print(b.blobId, b.filename, b.contentType, b.numBytes, b.sha256, b.createdAt)
  }

  // `cursor` is an opaque token; only present when more results remain.
  if let cursor = page1.cursor {
    let page2 = try await blobs.list(cursor: cursor)
    _ = page2.items
  }
  // #endregion example
}
