import JsBaoClient

// List every document the group has access to. Swift returns untyped
// `[[String: Any]]`.
func listDocuments(client: JsBaoClient, groupType: String, groupId: String) async throws {
  // #region example
  let docs = try await client.groups.listDocuments(groupType: groupType, groupId: groupId)
  for doc in docs {
    print(doc["documentId"] ?? "", doc["title"] ?? "", doc["permission"] ?? "")
  }
  // #endregion example
  _ = docs
}
