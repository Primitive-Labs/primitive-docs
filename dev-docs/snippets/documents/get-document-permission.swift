import JsBaoClient

// Get the current user's permission level for a document. Swift returns a
// typed `DocumentPermission?` enum (vs JS's string literal union).
func getDocumentPermission(client: JsBaoClient, documentId: String) {
  // #region example
  let permission = client.documents.getDocumentPermission(documentId: documentId)
  // #endregion example
  _ = permission
}
