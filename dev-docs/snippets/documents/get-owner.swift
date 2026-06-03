import JsBaoClient

// Swift-only convenience: fetch the document and extract its owner id.
// In JavaScript, read `createdBy` off `documents.get(id)` directly.
func getOwner(client: JsBaoClient, documentId: String) async throws {
  // #region example
  let ownerId = try await client.documents.getOwner(documentId: documentId)
  // #endregion example
  _ = ownerId
}
