import JsBaoClient

// Documents must be opened before querying or saving data in them. Await the
// open before the first query — the document is ready once open() resolves.
func openThenQuery(client: JsBaoClient, documentId: String) async throws {
  // #region example
  _ = try await client.documents.open(documentId)
  let result = Task.query([:], options: QueryOptions(documents: [documentId]))
  // #endregion example
  _ = result
}
