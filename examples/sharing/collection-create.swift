import JsBaoClient

// Create a collection, put documents in it, and share the whole set at once.
func createCollection(
  client: JsBaoClient,
  designDocId: String,
  specDocId: String
) async throws {
  // #region example
  // Create a collection and put documents in it
  let collection = try await client.collections.create(
    params: CreateCollectionParams(name: "Project Phoenix")
  )
  _ = try await client.collections.addDocument(collectionId: collection.collectionId, documentId: designDocId)
  _ = try await client.collections.addDocument(collectionId: collection.collectionId, documentId: specDocId)

  // One grant covers the whole set — including documents added later
  _ = try await client.collections.addMember(
    collectionId: collection.collectionId,
    params: .email("alice@example.com", permission: .readWrite)
  )
  // #endregion example
}
