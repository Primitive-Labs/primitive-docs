import JsBaoClient

// List app-level invitations (admin/owner only). Returns a typed
// `{ items, cursor }` page.
func list(client: JsBaoClient) async throws {
  // #region example
  let page = try await client.invitations.list(limit: 50)
  for invitation in page.items {
    print(invitation.email, invitation.accepted)
  }
  let nextCursor = page.cursor
  // #endregion example
  _ = nextCursor
}
