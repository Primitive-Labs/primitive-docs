import JsBaoClient

// Real-time database reads: subscriptions deliver deltas only, so pair the
// `subscribe` call with one operation call for the initial state. Keep the
// operation's filter and the subscription's filter semantically equivalent.
func liveOpenTickets(
  client: JsBaoClient,
  dbId: String,
  applyChanges: @escaping ([DatabaseChangeEvent]) -> Void
) async throws {
  // #region example
  let initial = try await client.databases.executeOperation(databaseId: dbId, name: "listMyTickets")
  let unsub = try client.databases.subscribe(
    databaseId: dbId,
    subscriptionKey: "my-open-tickets",
    options: DatabaseSubscribeOptions(onChange: { event in
      if event.isOrigin { return } // this tab wrote it
      applyChanges(event.changes)
    })
  )
  // #endregion example
  _ = initial
  _ = unsub
}
