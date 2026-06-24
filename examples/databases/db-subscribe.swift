import JsBaoClient

// React to server-side database changes in real time. The subscription
// (key, access rule, filter, select) is defined in TOML; the client binds
// to it and receives matching deltas until unsubscribed.
func watchOpenTickets(
  client: JsBaoClient,
  databaseId: String,
  removeTicket: @escaping (String) -> Void,
  upsertTicket: @escaping (Any?) -> Void
) throws -> () -> Void {
  // #region example
  let unsub = try client.databases.subscribe(
    databaseId: databaseId,
    subscriptionKey: "my-open-tickets",
    options: DatabaseSubscribeOptions(onChange: { event in
      // event.originConnectionId, event.originUserId, event.isOrigin, event.isOriginUser
      if event.isOrigin {
        // This same tab wrote it — the UI is already updated optimistically.
        return
      }
      for change in event.changes {
        // change.op:         "save" | "patch" | "delete" | "increment" | ...
        // change.changeType: "enter" | "update" | "leave"
        // change.data, change.previousData (subject to the select projection)
        if change.op == "delete" { removeTicket(change.id) } else { upsertTicket(change.data) }
      }
    })
  )

  // Return the teardown handle — call it on unmount to stop receiving deltas.
  return unsub
  // #endregion example
}
