import JsBaoClient

// Evict all locally stored document data. Swift takes no options (evicts every
// document) and does not throw.
func evictAll(client: JsBaoClient) async {
  // #region example
  await client.documents.evictAll()
  // #endregion example
}
