import JsBaoClient

// Update a document's presentation fields: title, thumbnail, and metadata.
func updateMetadata(client: JsBaoClient, documentId: String, blobId: String) async throws {
  // #region example
  _ = try await client.documents.update(
    documentId: documentId,
    data: UpdateDocumentData(
      title: "Q2 Planning",
      thumbnailBlobId: .value(blobId),                              // a blob you uploaded
      metadata: ["color": "blue", "tags": ["plan", "q2"]]          // ≤4KB JSON, replace semantics
    )
  )
  // #endregion example
}
