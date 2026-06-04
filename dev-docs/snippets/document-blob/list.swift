import JsBaoClient

func list(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Returns a typed DocumentBlobListResult ({ items, cursor }).
  let page = try await blobs.list(limit: 50)
  let firstBlobId = page.items.first?.blobId
  let cursor = page.cursor  // opaque pagination token (nil when no more pages)
  // #endregion example
  _ = (page, firstBlobId, cursor)
}
