import JsBaoClient

// Create a new group. `groupType`, `groupId`, and `name` are required.
// Swift takes an untyped `[String: Any]` and returns `[String: Any]`.
func create(client: JsBaoClient) async throws {
  // #region example
  let group = try await client.groups.create(params: [
    "groupType": "team",
    "groupId": "design",
    "name": "Design Team",
    "description": "Product design crew",
  ])
  // #endregion example
  _ = group
}
