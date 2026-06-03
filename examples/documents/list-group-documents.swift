import JsBaoClient

// Documents the user can access via a group they belong to.
func listGroupDocuments(client: JsBaoClient) async throws {
  // #region example
  let documents = try await client.groups.listDocuments(groupType: "team", groupId: "engineering")
  // #endregion example
  _ = documents
}
