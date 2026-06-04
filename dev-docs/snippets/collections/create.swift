import JsBaoClient

// Create a new collection. `name` is required; `collectionType`/`contextId`
// are immutable after create.
func create(client: JsBaoClient) async throws {
  // #region example
  let collection = try await client.collections.create(
    params: CreateCollectionParams(
      name: "Q3 Planning",
      description: "Docs for the Q3 planning cycle",
      collectionType: "default"
    )
  )
  // #endregion example
  _ = collection
}
