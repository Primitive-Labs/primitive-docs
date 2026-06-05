import JsBaoClient

// Subscribe to real-time database changes for a server-registered subscription.
// Returns an unsubscribe handle — call it to stop receiving changes.
func subscribe(
  client: JsBaoClient,
  databaseId: String,
  subscriptionKey: String,
  currentUserId: String
) throws {
  // #region example
  let unsubscribe = try client.databases.subscribe(
    databaseId: databaseId,
    subscriptionKey: subscriptionKey,
    options: DatabaseSubscribeOptions(
      params: ["userId": currentUserId],
      onChange: { event in
        for change in event.changes {
          // change.changeType is "enter" | "update" | "leave"
          print(change.op, change.id, change.data ?? "")
        }
      }
    )
  )
  // Later: stop receiving changes.
  unsubscribe()
  // #endregion example
}
