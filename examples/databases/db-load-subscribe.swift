import Foundation
import JsBaoClient

// Canonical real-time pattern: load the full current state once with a regular
// operation, then subscribe for deltas. Keep the operation's filter and the
// subscription's filter semantically equivalent so the UI doesn't flicker.
// Returns the unsub teardown — call it on unmount.
func liveTickets(
  client: JsBaoClient,
  databaseId: String,
  render: @escaping ([[String: Any]]) -> Void
) async throws -> () -> Void {
  // #region example
  // Loaded rows arrive as JSONValue, subscription deltas as [String: Any] —
  // normalize to one representation so deltas can merge into loaded rows.
  let rowDictionary: (JSONValue) -> [String: Any] = { value in
    guard let data = try? JSONEncoder().encode(value) else { return [:] }
    return (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
  }

  // 1. Initial load — full current state.
  let loaded = try await client.databases.executeOperation(
    databaseId: databaseId, name: "list-my-open-tickets"
  )
  var byId: [String: [String: Any]] = [:]
  for ticket in loaded["data"]?.arrayValue ?? [] {
    if let id = ticket["id"]?.stringValue { byId[id] = rowDictionary(ticket) }
  }
  render(Array(byId.values))

  // 2. Subscribe for delta updates.
  let unsub = try client.databases.subscribe(
    databaseId: databaseId,
    subscriptionKey: "my-open-tickets",
    options: DatabaseSubscribeOptions(onChange: { event in
      for change in event.changes {
        if change.op == "delete" {
          byId.removeValue(forKey: change.id)
        } else if change.op == "save" {
          // save delivers the full row.
          byId[change.id] = change.data as? [String: Any] ?? [:]
        } else {
          // patch / increment / addToSet / removeFromSet deliver ONLY the
          // changed fields — merge them; assigning would blank the rest.
          // On a cache miss (a patch brought the row into the filter set),
          // the pre-write row in previousData supplies the base.
          var row = byId[change.id] ?? change.previousData as? [String: Any] ?? [:]
          for (field, value) in change.data as? [String: Any] ?? [:] { row[field] = value }
          byId[change.id] = row
        }
      }
      render(Array(byId.values))
    })
  )

  // 3. Return teardown — call this on unmount.
  return unsub
  // #endregion example
}
