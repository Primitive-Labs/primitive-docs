import JsBaoClient

// Fires when collaborator awareness (presence/cursors) changes for a document.
func awareness(client: JsBaoClient) {
  // #region example
  let sub = client.events.on(.awareness) { (event: AwarenessEvent) in
    // Swift delivers a full snapshot (`states`); JS delivers added/updated/removed deltas.
    print(event.documentId, "states:", event.states.count)
  }
  // #endregion example
  _ = sub
}
