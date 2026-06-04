import JsBaoClient

// Close a document to stop syncing it. Pass `evictLocal: true` via
// CloseDocumentOptions to also drop the local cached copy.
//
// Note: Swift's `close` returns Void (it does not surface the `{ evicted }`
// flag the JS client returns). Use `hasLocalCopy(documentId:)` afterward if you
// need to confirm whether the local copy is still present.
func closeDocument(client: JsBaoClient, documentId: String) async {
  // #region example
  // Close and stop syncing
  await client.documents.close(documentId)

  // Close and remove the local cached copy
  await client.documents.close(
    documentId,
    options: CloseDocumentOptions(evictLocal: true)
  )
  // #endregion example
}
