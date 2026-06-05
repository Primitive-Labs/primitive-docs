import JsBaoClient

// An "everything I can access" surface: combine owned + directly shared
// documents with collection (and group) memberships.
func listAccessible(client: JsBaoClient) async throws {
  // #region example
  let owned = try await client.me.ownedDocuments()
  let shared = try await client.me.sharedDocuments().items
  let collections = try await client.collections.list()
  // then iterate collections / group memberships and call
  // collections.listDocuments / groups.listDocuments.
  // #endregion example
  _ = (owned, shared, collections)
}
