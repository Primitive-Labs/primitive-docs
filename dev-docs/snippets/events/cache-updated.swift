import JsBaoClient

// Fires when an internal KV cache entry (e.g. the `me` record) refreshes from
// the server.
func onCacheUpdated(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.cacheUpdated) { (event: CacheUpdatedEvent) in
    print("cache key updated:", event.key, "from", event.source)
  }
  // #endregion example
  _ = sub
}
