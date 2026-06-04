import JsBaoClient

// Documents must be opened before querying or saving data in them. Await the
// open before the first query — the document is ready once open() resolves.
// `tasks` is a TypedModel bound to that document.
func openThenQuery(
  client: JsBaoClient,
  documentId: String,
  tasks: TypedModel<Task>
) async throws {
  // #region example
  _ = try await client.documents.open(documentId)
  let result = tasks.query([:])
  // #endregion example
  _ = result
}
