import JsBaoClient

// Create a new document with typed `CreateDocumentOptions`. `create` returns
// only the document's `metadata` blob — not its id (use `createWithAlias`
// when you need the id back).
func create(client: JsBaoClient) async throws {
  // #region example
  let result = try await client.documents.create(options: CreateDocumentOptions(
    title: "Q3 Roadmap",
    tags: ["planning"],
    metadata: ["color": "blue"]
  ))
  let metadata = result.metadata
  // #endregion example
  _ = metadata
}
