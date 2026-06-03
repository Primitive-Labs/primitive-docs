import JsBaoClient

func deleteX(
  client: JsBaoClient,
  documentId: String,
  blobId: String
) async throws {
  // #region example
  let blobs = client.documents.blobs(documentId: documentId)
  // Swift returns an untyped [String: Any] (vs JS `{ deleted }`).
  let result = try await blobs.delete(blobId: blobId)
  let deleted = result["deleted"] as? Bool ?? false
  // #endregion example
  _ = deleted
}
