import JsBaoClient

// Check whether client and server hold identical document state. Swift is a
// synchronous local read (vs JS's async state-vector round-trip).
func inSync(client: JsBaoClient, documentId: String) {
  // #region example
  let synced = client.documents.inSync(documentId: documentId)
  // #endregion example
  _ = synced
}
