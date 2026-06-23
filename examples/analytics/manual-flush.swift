import JsBaoClient

// Events are buffered and flushed automatically (every 100ms, or earlier when
// batched). client.destroy() triggers a final flush on teardown, so a manual
// flush is only needed to force an immediate send.
func flushAnalytics(client: JsBaoClient) {
  // #region example
  client.analytics.flush()
  // #endregion example
}
