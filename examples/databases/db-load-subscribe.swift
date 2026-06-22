import JsBaoClient

// Canonical real-time pattern: load the full current state once with a regular
// operation, then subscribe for deltas. Keep the operation's filter and the
// subscription's filter semantically equivalent so the UI doesn't flicker.
// Returns the unsub teardown — call it on unmount.
func liveTickets(
  client: JsBaoClient,
  databaseId: String,
  render: @escaping ([Any]) -> Void
) async throws -> () -> Void {
  // #region example
  // 1. Initial load — full current state.
  let loaded = try await client.databases.executeOperation(
    databaseId: databaseId, name: "list-my-open-tickets"
  )
  var byId: [String: Any] = [:]
  for ticket in loaded["data"]?.arrayValue ?? [] {
    if let id = ticket["id"]?.stringValue { byId[id] = ticket }
  }
  render(Array(byId.values))

  // 2. Subscribe for delta updates.
  let unsub = try client.databases.subscribe(
    databaseId: databaseId,
    subscriptionKey: "my-open-tickets",
    options: DatabaseSubscribeOptions(onChange: { event in
      for change in event.changes {
        if change.op == "delete" { byId.removeValue(forKey: change.id) }
        else { byId[change.id] = change.data } // save / patch / increment / addToSet / removeFromSet
      }
      render(Array(byId.values))
    })
  )

  // 3. Return teardown — call this on unmount.
  return unsub
  // #endregion example
}
