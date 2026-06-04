import JsBaoClient

func resumeUpload(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  let resumed = blobs.resumeUpload(blobId: blobId)  // true if a paused upload was resumed
  // #endregion example
  _ = resumed
}
