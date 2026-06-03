import JsBaoClient

// Force-flush the buffered analytics queue immediately.
func flush(client: JsBaoClient) {
  // #region example
  client.flushAnalytics()
  // #endregion example
}
