import JsBaoClient

// Grant or change a user's permission. Swift takes an untyped params dict and
// returns an untyped `[String: Any]`.
func updatePermissions(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let result = try await client.documents.updatePermissions(
    documentId: documentId,
    params: [
      "email": "teammate@example.com",
      "permission": "read-write",
      "sendEmail": true,
    ]
  )
  // #endregion example
  _ = result
}
