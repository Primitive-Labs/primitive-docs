import JsBaoClient

// Fires when a document finishes loading (from local store or a fresh server sync).
func documentLoaded(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.documentLoaded) { (event: DocumentLoadedEvent) in
    print(event.documentId, "loaded from", event.source)
  }
  // #endregion example
  _ = sub
}
