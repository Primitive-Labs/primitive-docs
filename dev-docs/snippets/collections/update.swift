import JsBaoClient

// Update a collection's name or description.
func update(client: JsBaoClient, collectionId: String) async throws {
  // #region example
  let collection = try await client.collections.update(
    collectionId: collectionId,
    params: UpdateCollectionParams(
      name: "Q3 Planning (final)",
      description: "Frozen for the planning review"
    )
  )
  // #endregion example
  _ = collection
}
