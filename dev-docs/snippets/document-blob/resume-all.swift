import JsBaoClient

func resumeAll(client: JsBaoClient, documentId: String) {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  blobs.resumeAll()  // resume every paused upload for this document
  // #endregion example
}
