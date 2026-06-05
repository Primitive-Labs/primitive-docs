import JsBaoClient

// Group documents into a collection and share them as a unit. Permissions on a
// collection are additive (max-wins) and fan out to every document inside it.
func manageCollection(
  client: JsBaoClient,
  documentId: String,
  targetUserId: String
) async throws {
  // #region example
  // Create
  let collection = try await client.collections.create(
    params: CreateCollectionParams(name: "Q1 Reports", description: "All quarterly report documents")
  )
  let collectionId = collection.collectionId

  // Add / remove documents
  _ = try await client.collections.addDocument(collectionId: collectionId, documentId: documentId)
  _ = try await client.collections.removeDocument(collectionId: collectionId, documentId: documentId)

  // Share with a group (fans out to every document in the collection)
  _ = try await client.collections.grantGroupPermission(
    collectionId: collectionId,
    params: GrantCollectionGroupPermissionParams(groupType: "team", groupId: "engineering", permission: "read-write")
  )

  // Share with an individual user (O(1)). userId only — no email form.
  _ = try await client.collections.addMember(
    collectionId: collectionId,
    params: .user(targetUserId, permission: .reader)
  )
  // #endregion example
}
