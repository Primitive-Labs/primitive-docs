import JsBaoClient

// Update document metadata. Swift takes an untyped data dict and returns
// an untyped `[String: Any]`.
func update(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let info = try await client.documents.update(documentId: documentId, data: [
    "title": "Q3 Roadmap (final)",
    "metadata": ["color": "green"],
  ])
  // #endregion example
  _ = info
}
