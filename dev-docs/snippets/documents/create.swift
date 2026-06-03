import JsBaoClient

// Create a new document. Swift takes an untyped options dict and returns
// an untyped `[String: Any]` envelope.
func create(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.create(options: [
    "title": "Q3 Roadmap",
    "tags": ["planning"],
    "metadata": ["color": "blue"],
  ])
  let metadata = result["metadata"]
  // #endregion example
  _ = metadata
}
