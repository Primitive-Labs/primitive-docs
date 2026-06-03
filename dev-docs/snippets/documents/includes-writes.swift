import JsBaoClient

// Check whether the server has all of this client's writes. Swift is a
// synchronous local read (vs JS's async state-vector round-trip).
func includesWrites(client: JsBaoClient, documentId: String) {
  // #region example
  let confirmed = client.documents.includesWrites(documentId: documentId)
  // #endregion example
  _ = confirmed
}
