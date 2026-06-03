import JsBaoClient

// List documents created locally but not yet committed. Swift is synchronous
// and returns just the `[String]` document IDs (vs JS's richer objects).
func listPendingCreates(client: JsBaoClient) {
  // #region example
  let pendingIds = client.documents.listPendingCreates()
  // #endregion example
  _ = pendingIds
}
