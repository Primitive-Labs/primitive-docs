import JsBaoClient

// Inspect and control the per-document upload queue. Failed uploads retry with
// exponential backoff. Concurrency is a client-wide setting (applies to all
// documents).
func manageUploadQueue(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) {
  let blobs = client.documents.blobs(documentId: documentId)
  // #region example
  // Inspect what's queued for this document. Each BlobUploadStatus carries
  // queueId, blobId, filename, contentType, numBytes, status, attempts,
  // nextAttemptAt, lastError.
  let tasks = blobs.uploads()

  // Pause/resume by blobId (the queueId is the blobId for document uploads).
  _ = blobs.pauseUpload(blobId: blobId)
  _ = blobs.resumeUpload(blobId: blobId)

  blobs.pauseAll()
  blobs.resumeAll()

  // Concurrency is set on the client (global, all documents).
  client.setBlobUploadConcurrency(5) // min 1; default 2
  let concurrency = client.getBlobUploadConcurrency()
  // #endregion example
  _ = (tasks, concurrency)
}
