import JsBaoClient

// React to server-side database changes in real time. The subscription
// (key, access rule, filter, select) is defined in TOML; the client binds
// to it and receives matching deltas until unsubscribed.
func watchOpenTickets(
  client: JsBaoClient,
  databaseId: String,
  removeTicket: @escaping (String) -> Void,
  replaceTicket: @escaping (String, Any?) -> Void,
  mergeTicket: @escaping (String, [String: Any]) -> Void
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
        // change.changeType: "enter" | "update" | "leave"
        // change.op decides the shape of change.data (all subject to `select`):
        //   "save"  → the full row                     "delete" → nil
        //   "patch" → the patched fields' new values
        //   "increment" / "addToSet" / "removeFromSet" → the op input
        //     (amounts / values added or removed), NOT the resulting values —
        //     derive those from previousData (the pre-write row).
        if change.op == "delete" {
          removeTicket(change.id)
        } else if change.op == "save" {
          replaceTicket(change.id, change.data)
        } else if change.op == "patch" {
          // Merge — assigning change.data would blank every untouched field.
          mergeTicket(change.id, change.data as? [String: Any] ?? [:])
        } else {
          // increment / addToSet / removeFromSet: compute each field's new value.
          let prev = change.previousData as? [String: Any] ?? [:]
          var resolved: [String: Any] = [:]
          for (field, input) in change.data as? [String: Any] ?? [:] {
            if change.op == "increment" {
              resolved[field] = (prev[field] as? Double ?? 0) + (input as? Double ?? 0)
            } else {
              let current = prev[field] as? [String] ?? []
              let values = input as? [String] ?? []
              resolved[field] = change.op == "addToSet"
                ? current + values.filter { !current.contains($0) }
                : current.filter { !values.contains($0) }
            }
          }
          mergeTicket(change.id, resolved)
        }
      }
    })
  )

  // Return the teardown handle — call it on unmount to stop receiving deltas.
  return unsub
  // #endregion example
}
