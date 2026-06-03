import JsBaoClient

// Fires when a document is opened (subscribed to) by this client.
func documentOpened(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.documentOpened) { (event: DocumentOpenedEvent) in
    print("opened", event.documentId)
  }
  // #endregion example
  _ = sub
}
