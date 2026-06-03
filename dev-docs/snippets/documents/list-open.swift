import JsBaoClient

// List the IDs of all currently open documents. Synchronous local read.
func listOpen(client: JsBaoClient) {
  // #region example
  let openIds = client.documents.listOpen()
  // #endregion example
  _ = openIds
}
