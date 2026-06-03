import JsBaoClient

// Fires when this client's permission level on a document changes.
func permission(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.permission) { (event: PermissionEvent) in
    print(event.documentId, "->", event.permission.rawValue)
  }
  // #endregion example
  _ = sub
}
