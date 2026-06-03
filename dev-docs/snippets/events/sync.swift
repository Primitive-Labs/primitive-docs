import JsBaoClient

// Fires when a document's sync state with the server flips.
func sync(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.sync) { (event: SyncEvent) in
    print(event.documentId, "synced:", event.synced)
  }
  // #endregion example
  _ = sub
}
