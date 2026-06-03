import JsBaoClient

// Fires when a document's metadata (title, tags, etc.) is created, updated, or removed.
func documentMetadataChanged(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.documentMetadataChanged) { (event: DocumentMetadataChangedEvent) in
    // Swift `source` is "local" | "remote" (JS uses "local" | "server" | "idb").
    print(event.documentId, event.action, "from", event.source ?? "?")
  }
  // #endregion example
  _ = sub
}
