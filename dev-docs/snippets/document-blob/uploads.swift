import JsBaoClient

func uploads(client: JsBaoClient, documentId: String) {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Status of all tracked uploads for this document (newest first).
  let statuses = blobs.uploads()
  let pending = statuses.filter { $0.status == "pending" }
  // #endregion example
  _ = pending
}
