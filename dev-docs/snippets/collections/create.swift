import JsBaoClient

// Create a new collection. Swift takes an untyped params dict and returns
// an untyped `[String: Any]` envelope.
func create(client: JsBaoClient) async throws {
  // #region example
  let collection = try await client.collections.create(params: [
    "name": "Q3 Planning",
    "description": "Docs for the Q3 planning cycle",
    "collectionType": "default",
  ])
  // #endregion example
  _ = collection
}
