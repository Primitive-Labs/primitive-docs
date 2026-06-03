import JsBaoClient

// Atomic get-or-create of a per-user singleton document, then open it.
func getOrCreateLibrary(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.getOrCreateWithAlias(
    alias: ["scope": "user", "aliasKey": "default-doc"],
    title: "My Data"
  )
  if let documentId = result["documentId"] as? String {
    _ = try await client.documents.open(documentId)
  }
  // #endregion example
}
