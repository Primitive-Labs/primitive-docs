import JsBaoClient

// List, inspect, and delete a document's blobs.
func manageDocumentBlobs(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)

  let list = try await blobs.list(limit: 50)
  let meta = try await blobs.get(blobId: blobId)
  _ = try await blobs.delete(blobId: blobId)
  // #endregion example
  _ = (list, meta)
}

// Warm the local cache by prefetching blobs before they're needed.
func prefetchDocumentBlobs(
  client: JsBaoClient,
  documentId: String,
  blobId1: String,
  blobId2: String
) async {
  // #region prefetch
  let blobs = client.documents.blobs(documentId: documentId)
  await blobs.prefetch(blobIds: [blobId1, blobId2], concurrency: 4)
  // #endregion prefetch
}
