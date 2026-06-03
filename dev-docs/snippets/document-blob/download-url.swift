import JsBaoClient

func downloadUrl(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  let url = blobs.downloadUrl(blobId: blobId, disposition: .attachment)
  // #endregion example
  _ = url
}
