import JsBaoClient

// Fires when a document is closed (unsubscribed) by this client.
func documentClosed(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.documentClosed) { (event: DocumentClosedEvent) in
    print("closed", event.documentId)
  }
  // #endregion example
  _ = sub
}
