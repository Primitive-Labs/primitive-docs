import JsBaoClient

// List app-level invitations (admin/owner only). Swift takes flat
// `limit`/`cursor` args and returns the `{ items, cursor }` envelope as an
// untyped `[String: Any]`, so the page is unpacked via dictionary casts.
func list(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.invitations.list(limit: 50)
  let items = page["items"] as? [[String: Any]] ?? []
  for invitation in items {
    let email = invitation["email"] as? String ?? ""
    let accepted = invitation["accepted"] as? Bool ?? false
    print(email, accepted)
  }
  let nextCursor = page["cursor"] as? String
  // #endregion example
  _ = nextCursor
}
