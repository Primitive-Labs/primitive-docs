import JsBaoClient

// Bind values to a parameterized subscription — the bound `params.*` are
// visible to the subscription's `access` and `filter` CEL.
func watchTeamTickets(
  client: JsBaoClient,
  databaseId: String,
  handleChange: @escaping (DatabaseChangeEvent) -> Void
) throws -> () -> Void {
  // #region example
  let unsub = try client.databases.subscribe(
    databaseId: databaseId,
    subscriptionKey: "tickets-by-team",
    options: DatabaseSubscribeOptions(
      params: ["teamId": "eng"],
      onChange: { event in
        for change in event.changes { handleChange(change) }
      }
    )
  )
  // #endregion example
  return unsub
}
