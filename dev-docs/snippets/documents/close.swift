import JsBaoClient

// Close an open document. Swift returns `Void` (vs JS `{ evicted }`) and takes
// a typed `CloseDocumentOptions`.
func close(client: JsBaoClient, documentId: String) async {
  // #region example
  await client.documents.close(
    documentId, options: CloseDocumentOptions(evictLocal: true)
  )
  // #endregion example
}
