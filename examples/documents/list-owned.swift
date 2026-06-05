import JsBaoClient

// Documents the user owns (created them, or had ownership transferred to them).
func listOwnedDocuments(client: JsBaoClient) async throws {
  // #region example
  // A typed `[DocumentInfo]` — each row carries title, permission, tags, …
  let owned = try await client.me.ownedDocuments(tag: "channel")

  for doc in owned {
    print(doc.title, doc.permission)
  }
  // #endregion example
  _ = owned
}
