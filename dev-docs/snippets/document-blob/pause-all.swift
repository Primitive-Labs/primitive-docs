import JsBaoClient

func pauseAll(client: JsBaoClient, documentId: String) {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  blobs.pauseAll()  // pause every in-progress upload for this document
  // #endregion example
}
