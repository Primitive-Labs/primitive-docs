import JsBaoClient

func pauseUpload(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  let paused = blobs.pauseUpload(blobId: blobId)  // true if an in-progress upload was paused
  // #endregion example
  _ = paused
}
