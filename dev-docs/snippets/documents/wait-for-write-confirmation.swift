import JsBaoClient

// Wait until the server confirms it has all of this client's writes. Returns a
// Bool — true once confirmed, false on timeout (it does not throw).
func waitForWriteConfirmation(client: JsBaoClient, documentId: String) async {
  // #region example
  let confirmed = await client.documents.waitForWriteConfirmation(documentId: documentId)
  // #endregion example
  _ = confirmed
}
