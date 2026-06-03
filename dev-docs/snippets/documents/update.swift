import JsBaoClient

// Update document metadata with typed `UpdateDocumentData`. Replace semantics:
// omit a field to leave it unchanged; pass `.null` metadata (or `.clear`
// thumbnailBlobId) to clear it.
func update(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let info = try await client.documents.update(
    documentId: documentId,
    data: UpdateDocumentData(
      title: "Q3 Roadmap (final)",
      metadata: ["color": "green"]
    )
  )
  // #endregion example
  _ = info
}
