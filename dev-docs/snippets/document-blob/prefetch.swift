import JsBaoClient

func prefetch(
  client: JsBaoClient,
  documentId: String,
  blobIds: [String]
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Pre-download blobs into the local cache for offline access. Best-effort:
  // per-blob failures are swallowed. `concurrency` defaults to 2.
  await blobs.prefetch(blobIds: blobIds, concurrency: 4)
  // #endregion example
}
