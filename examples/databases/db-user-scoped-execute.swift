import JsBaoClient

// Operations that scope data to the calling user via $user.userId. The server
// stamps ownerId and assigns the record id — never trust a caller-supplied id.
func userScopedItems(client: JsBaoClient, dbId: String) async throws {
  // #region example
  // Each user only sees their own items (the operation filters on $user.userId).
  let result = try await client.databases.executeOperation(
    databaseId: dbId, name: "myItems"
  )

  // Creates an item owned by the calling user; server assigns the id.
  let createResult = try await client.databases.executeOperation(
    databaseId: dbId, name: "createItem",
    options: ExecuteOperationOptions(params: ["title": "My Item"])
  )
  // executeOperation returns a JSONValue; the mutation result shape is
  // { results: [{ success, id }] } — read the server-assigned id from it.
  let itemId = createResult["results"]?.arrayValue?.first?["id"]?.stringValue // server-assigned ULID
  // #endregion example
  _ = (result, itemId)
}
