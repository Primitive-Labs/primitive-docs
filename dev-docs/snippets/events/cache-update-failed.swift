import JsBaoClient

// Fires when an internal KV cache entry fails to refresh from the server.
func onCacheUpdateFailed(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.cacheUpdateFailed) { (event: CacheUpdateFailedEvent) in
    print("cache refresh failed for", event.key, ":", event.error)
  }
  // #endregion example
  _ = sub
}
